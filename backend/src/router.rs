use axum::{
    extract::{Path, State},
    http::{Request, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use axum_extra::extract::cookie::{Cookie, PrivateCookieJar, SameSite};
use http::{HeaderValue, header::{AUTHORIZATION, ACCEPT, ORIGIN}, Method};
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::path::PathBuf;
use time::Duration;
use tower_http::cors::{Any, CorsLayer};

use axum_extra::routing::SpaRouter;

use crate::AppState;

#[derive(Deserialize)]
pub struct LoginDetails {
    username: String,
    password: String,
}

pub fn api_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_credentials(true)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([ORIGIN, AUTHORIZATION, ACCEPT])
        .allow_origin("http://127.0.0.1:9999".parse::<HeaderValue>().unwrap());
    let notes_router = Router::new()
        .route("/", get(view_records))
        .route("/create", post(create_record))
        .route(
            "/:id",
            get(view_one_record).put(edit_record).delete(destroy_record),
        )
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            validate_session,
        ));

    let auth_router = Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/forgot", post(forgot_password))
        .route("/logout", get(logout));

    Router::new()
        .route("/health", get(health_check))
        .nest("/notes", notes_router)
        .nest("/auth", auth_router)
        .with_state(state)
        .layer(cors)
}

pub fn create_router(static_folder: PathBuf, state: AppState) -> Router {
    let api_router = api_router(state);

    Router::new()
        .nest("/api", api_router)
        .merge(SpaRouter::new("/", static_folder).index_file("index.html"))
}

pub async fn health_check() -> Response {
    (StatusCode::OK, "OK!").into_response()
}

pub async fn register(
    State(state): State<AppState>,
    Json(newuser): Json<LoginDetails>,
) -> impl IntoResponse {  
    
     let hashed_password = bcrypt::hash(newuser.password, 10).unwrap();

    let query = sqlx::query("INSERT INTO users (username, password) values ($1, $2)")
        .bind(newuser.username)
        .bind(hashed_password)
        .execute(&state.postgres);

    match query.await {
        Ok(_) => (StatusCode::CREATED, "Account created!".to_string()).into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            format!("Something went wrong: {e}"),
        )
            .into_response(),
    }
}

pub async fn login(
    State(mut state): State<AppState>,
    jar: PrivateCookieJar,
    Json(login): Json<LoginDetails>,
) -> Result<(PrivateCookieJar, StatusCode), StatusCode> {
    if jar.get("foo").is_some() {
        return Ok((jar, StatusCode::OK));
    }

    let query = sqlx::query("SELECT * FROM users WHERE username = $1")
        .bind(&login.username)
        .fetch_optional(&state.postgres);

    match query.await {
        Ok(res) => {
            if bcrypt::verify(login.password, res.unwrap().get("password")).is_err() {
                return Err(StatusCode::BAD_REQUEST);
            }

            let session_id = rand::random::<u64>().to_string();

            println!("Session id is: {session_id}");

            state.cookielist.insert(session_id.clone(), login.username);

            println!("{:?}", state.cookielist);

            let cookie = Cookie::build("foo", session_id)
                .secure(true)
                .same_site(SameSite::Strict)
                .http_only(true)
                .path("/")
                .max_age(Duration::WEEK)
                .finish();

            Ok((jar.add(cookie), StatusCode::OK))

        }

        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

pub async fn logout(State(mut state): State<AppState>, jar: PrivateCookieJar) -> PrivateCookieJar {
    let Some(cookie) = jar.get("foo").map(|cookie| cookie.value().to_owned()) else {
        return jar
    };

    state.cookielist.remove_entry(&cookie);

    jar.remove(Cookie::named("foo"))
}

pub async fn forgot_password(
    State(state): State<AppState>,
    Json(email_recipient): Json<String>,
) -> Response {
    let new_password = Alphanumeric.sample_string(&mut rand::thread_rng(), 16);

    let credentials = Credentials::new(state.smtp_email, state.smtp_password);

    let message = format!("Hello!\n\n Your new password is: {new_password} \n\n Don't share this with anyone else. \n\n Kind regards, \nJosh");

    let email = Message::builder()
        .from("noreply <joshua.mo.876@gmail.com".parse().unwrap())
        .to(email_recipient.parse().unwrap())
        .subject("Forgot Password")
        .header(ContentType::TEXT_PLAIN)
        .body(message)
        .unwrap();

    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .unwrap()
        .credentials(credentials)
        .build();

    match mailer.send(&email) {
        Ok(_) => (StatusCode::OK, "Sent".to_string()).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, format!("Error: {e}")).into_response(),
    }
}

pub async fn validate_session<B>(
    jar: PrivateCookieJar,
    State(state): State<AppState>,
    request: Request<B>,
    next: Next<B>,
) -> (PrivateCookieJar, Response) {
    let Some(cookie) = jar.get("foo").map(|cookie| cookie.value().to_owned()) else {

        println!("Couldn't find a cookie in the jar");
        return (jar,(StatusCode::FORBIDDEN, "Forbidden!".to_string()).into_response())
    };
    
    println!("Value is {cookie}");
    
    if state.cookielist.contains_key(&cookie) {
        println!("Cookie found");
        (jar, next.run(request).await)
    } else {
        println!("Cookie value doesn't match hashmap key :(");
        (
            jar.remove(Cookie::named("foo")),
            (StatusCode::FORBIDDEN, "Forbidden!").into_response(),
        )
    }
}

#[derive(sqlx::FromRow, Deserialize, Serialize)]
pub struct Note {
    id: i32,
    message: String,
    user_id: i32,
}

pub async fn view_records(State(state): State<AppState>) -> Response {
    let query = sqlx::query("SELECT * FROM notes ")
        .fetch_all(&state.postgres)
        .await
        .unwrap();

    let records = query
        .iter()
        .map(|row| Note {
            id: row.get("id"),
            message: row.get("message"),
            user_id: row.get("id"),
        })
        .collect::<Vec<Note>>();

    Json(records).into_response()
}

pub async fn view_one_record(Path(id): Path<String>, State(state): State<AppState>) -> Response {
    let query = sqlx::query_as::<_, Note>("SELECT * from notes WHERE id = $1")
        .bind(id)
        .fetch_one(&state.postgres)
        .await
        .unwrap();

    Json(query).into_response()
}

pub async fn create_record(State(state): State<AppState>, Json(message): Json<String>) -> Response {
    let query = sqlx::query("INSERT INTO notes (message) VALUES ($1)")
        .bind(message)
        .execute(&state.postgres)
        .await;

    match query {
        Ok(_) => (StatusCode::CREATED, "Record created!".to_string()).into_response(),
        Err(err) => (
            StatusCode::BAD_REQUEST,
            format!("Unable to create record: {err}"),
        )
            .into_response(),
    }
}

pub async fn edit_record(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(message): Json<String>,
) -> Response {
    let query = sqlx::query("UPDATE notes SET message = $1 WHERE id = $2")
        .bind(message)
        .bind(&id)
        .execute(&state.postgres)
        .await;

    match query {
        Ok(_) => (StatusCode::OK, format!("Record {id} edited ")).into_response(),
        Err(err) => (
            StatusCode::BAD_REQUEST,
            format!("Unable to edit message: {err}"),
        )
            .into_response(),
    }
}

pub async fn destroy_record(State(state): State<AppState>, Path(id): Path<String>) -> Response {
    let query = sqlx::query("DELETE FROM notes WHERE id = $1")
        .bind(&id)
        .execute(&state.postgres)
        .await;

    match query {
        Ok(_) => (StatusCode::OK, format!("Record {id} deleted ")).into_response(),
        Err(err) => (
            StatusCode::BAD_REQUEST,
            format!("Unable to edit message: {err}"),
        )
            .into_response(),
    }
}
