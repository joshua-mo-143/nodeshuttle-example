use axum::extract::FromRef;
use axum_extra::extract::cookie::Key;
use shuttle_secrets::SecretStore;
use sqlx::PgPool;
use std::collections::HashMap;
use std::path::PathBuf;
use sync_wrapper::SyncWrapper;

mod router;
use router::create_router;

#[derive(Clone)]
pub struct AppState {
    postgres: PgPool,
    cookielist: HashMap<String, String>,
    key: Key,
    smtp_email: String,
    smtp_password: String,
}

impl FromRef<AppState> for Key {
    fn from_ref(state: &AppState) -> Self {
        state.key.clone()
    }
}

#[shuttle_service::main]
async fn axum(
    #[shuttle_static_folder::StaticFolder] static_folder: PathBuf,
    #[shuttle_shared_db::Postgres] postgres: PgPool,
    #[shuttle_secrets::Secrets] secrets: SecretStore,
) -> shuttle_service::ShuttleAxum {

    sqlx::migrate!().run(&postgres).await;
    
    let smtp_email = secrets
        .get("SMTP_EMAIL")
        .expect("You need to set your SMTP_EMAIL secret!");

    let smtp_password = secrets
        .get("SMTP_PASSWORD")
        .expect("You need to set your SMTP_PASSWORD secret!");

    let state = AppState {
        postgres,
        cookielist: HashMap::new(),
        key: Key::generate(),
        smtp_email,
        smtp_password,
    };

    let router = create_router(static_folder, state);

    let sync_wrapper = SyncWrapper::new(router);
    Ok(sync_wrapper)
}
