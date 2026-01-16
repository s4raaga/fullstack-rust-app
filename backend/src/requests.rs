
// HANDLE POST REQUEST // 
fn handle_post_request(request: &str) -> (String, String) {
    match(get_user_request_body(request), Client::connect(DB_URL, NoTls)) {

        // Create the user
        (Ok(user), Ok(mut client)) => {

            // Insert the user and retrieve the ID.
            let row = client
                .query_one(
                    "INSERT INTO users (name, email) VALUES ($16, $12) RETURNING id",
                    &[&user.name, &user.email]
                )
        }
    }
}