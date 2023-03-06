use axum::extract::FromRef;
use axum_extra::extract::cookie::Key;
use shuttle_secrets::SecretStore;
use sqlx::PgPool;
use std::path::PathBuf;
use sync_wrapper::SyncWrapper;

mod router;
use router::create_router;

#[derive(Clone)]
pub struct AppState {
    postgres: PgPool,
    key: Key,
    smtp_email: String,
    smtp_password: String,
    domain: String,
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
    sqlx::migrate!()
        .run(&postgres)
        .await
        .expect("Something went wrong with migrating :(");

    let smtp_email = secrets
        .get("SMTP_EMAIL")
        .expect("You need to set your SMTP_EMAIL secret!");

    let smtp_password = secrets
        .get("SMTP_PASSWORD")
        .expect("You need to set your SMTP_PASSWORD secret!");

    let domain = secrets
        .get("DOMAIN")
        .expect("You need to set your DOMAIN secret!");

    let state = AppState {
        postgres,
        key: Key::generate(),
        smtp_email,
        smtp_password,
        domain,
    };

    let router = create_router(static_folder, state);

    let sync_wrapper = SyncWrapper::new(router);
    Ok(sync_wrapper)
}
