## Node CLI Shuttle Example
### Introduction
This is an example of what can be achieved by using [shuttle's](https://www.shuttle.rs) node CLI package to quickly bootstrap a Next.js application that uses Rust as a back end, complete with commands that integrate both sides together already built in.

We will be building a fully working login portal with a dashboard.
### Preview
### Packages/libs used
* Next: The whole point of this repo.
* React: The whole point of this repo (Next builds on React, so this is an unspoken pre-requisite).
* TailwindCSS: CSS.
* Autoprefix / PostCSS: CSS (TailwindCSS pre-requisites).

* shuttle_service: The whole point of this repo.
* shuttle_shared_db: Using shuttle's provisioned database.
* shuttle_secrets: shuttle secrets capabilities (environment variables).
* sync_wrapper: A wrapper for making async things, sync (default for deploying axum via shuttle)
* axum: A popular Rust web framework with easy to use syntax and highly compatible with tower-http middleware.
* axum_extra: An add-on library for axum. 
* tower_http: A Rust library for using many different types of middleware (rate limiting, auth, cors... etc) as well as easily making your own.
* bcrypt: Salted password hash encryption.
* lettre: A library for sending emails over SMTP.
* serde: A library for serializing and deserializing structs (required for Axum).
* rand: A random generator crate. We use this to generate session IDs but also can use it to generate random new strings, which is useful for password resets.
* sqlx: A library for working with databases and creating async connection pools.