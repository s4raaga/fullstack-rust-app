use postgres::{ Client, NoTls };
use postgres::Error as PostgresError;
use std::net::{ TcpListener, TcpStream };
use std::io::{ Read, Write };
use std::env;

mod requests;

#[macro_use]
extern crate serde_derive;
#[derive(Serialize, Deserialize)]
struct User {
    id: Option<i32>,
    name: String,
    email: String,
}

// CONSTANTS
const DB_URL: &str = env!("DATABASE_URL");

const OK_RESPONSE: &str =
"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE\r\nAccess-Control-Allow-Headers: Content-Type\r\n\r\n"; // allows everyone to access, wouldn't do that in prod !

const NOT_FOUND: &str = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
const INTERNAL_ERROR: &str = "HTTP/1.1 500 INTERNAL ERROR\r\n\r\n";



// MAIN FUNCTION //

fn main() {

    // Set Database
    if let Err(_) = set_database() {
        println!("Error setting the database!");
        return;
    }

    // Start server & print port
    let listener = TcpListener::bind("0.0.0.0:8080").unwrap();
    println!("Server listening on port 8080");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_client(stream);
            }
            Err(e) => {
                println!("Unable to connect: {}", e);
            }
        }
    }
}



// DB SETUP // 

fn set_database() -> Result<(), PostgresError> {

    let mut client = Client::connect(DB_URL, NoTls)?;

    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            email VARCHAR NOT NULL
            )
        "
    )?;

    Ok(())
}



// GET ID FROM REQUES URL FUNCTION //

fn get_id(request: &str) -> &str {
    request.split("/").nth(4).unwrap_or_default().split_whitespace().next().unwrap_or_default()
}



// DESERIALIZE USER FROM REQUEST BODY W/OUT ID //

fn get_user_request_body(request: &str) -> Result<User, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}



// HANDLE REQUESTS //

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0; 1024]; // Limit URLs
    let mut request = String::new();

    // Check the request and call the right fucntion to handle it.
    match stream.read(&mut buffer) {
        Ok(size) => {
            request.push_str(&String::from_utf8_lossy(&buffer[..size]));

            let (status_line, content) = match &*request {
                r if r.starts_with("OPTIONS") => (OK_RESPONSE.to_string(), "".to_string()),
                r if r.starts_with("POST /api/rust/users") => handle_post_request(r),
                r if r.starts_with("GET /api/rust/users/") => handle_get_request(r),
                r if r.starts_with("GET /api/rust/users") => handle_get_all_request(r),
                r if r.starts_with("PUT /api/rust/users/") => handle_put_request(r),
                r if r.starts_with("DELETE /api/rust/users/") => handle_delete_request(r),
                _ => (NOT_FOUND.to_string(), "404 not found".to_string()),
            };

            stream.write_all(format!("{}{}", status_line, content).as_bytes()).unwrap();
        }
        Err(e) => eprintln!("Unable to read stream: {}", e)
    }
}



/// Handle an HTTP POST /users request.
/// Expects:
/// - a JSON request body containing the new user's fields (name, email)
/// Creates:
/// - a new row in the `users` table
/// Returns:
/// - (status_line, response_body) where body is the created user as JSON
fn handle_post_request(request: &str) -> (String, String) {
    match(get_user_request_body(request), Client::connect(DB_URL, NoTls)) {

        // Create the user
        (Ok(user), Ok(mut client)) => {

            // Insert the user and retrieve the ID.
            let row = client
                .query_one(
                    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
                    &[&user.name, &user.email]
                )
                .unwrap();

        let user_id: i32 = row.get(0);

        // Fetch the newly created user record.
        match client.query_one("SELECT id, name, email FROM users WHERE id = $1", &[&user_id]) {
            Ok(row) => {
                let user = User {
                    id: Some(row.get(0)),
                    name: row.get(1),
                    email: row.get(2),
                };

                // Return the created user as JSON.
                (OK_RESPONSE.to_string(), serde_json::to_string(&user).unwrap())
            }

            // Insert succeeded but the follow-up read failed.
            Err(_) =>
                    (INTERNAL_ERROR.to_string(), "Failed to retrieve created user".to_string()),
            }
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}


/// HANDLE GET REQUEST
/// getting a single user
/// 
//handle get request
fn handle_get_request(request: &str) -> (String, String) {

    // Grab ID from URL & Connect to DB
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {
        (Ok(id), Ok(mut client)) =>

            // Return the user w/ the given ID.
            match client.query_one("SELECT * FROM users WHERE id = $1", &[&id]) {
                Ok(row) => {
                    let user = User {
                        id: row.get(0),
                        name: row.get(1),
                        email: row.get(2),
                    };

                    (OK_RESPONSE.to_string(), serde_json::to_string(&user).unwrap())
                }
                _ => (NOT_FOUND.to_string(), "User not found".to_string()),
            }

        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}



/// Handle a HTTP GET /users request (list all users).
/// Fetches:
/// - every row from the `users` table
/// Returns:
/// - (status_line, response_body) where body is a JSON array of users 
fn handle_get_all_request(_request: &str) -> (String, String) {

    match Client::connect(DB_URL, NoTls) {
        Ok(mut client) => {
            // Collect all users into a Vec<User> so we can serialize it to JSON.
            let mut users = Vec::new();

            // Query all user records. Each row becomes a User struct.
            for row in client.query("SELECT id, name, email FROM users", &[]).unwrap() {
                users.push(User {
                    id: row.get(0),
                    name: row.get(1),
                    email: row.get(2),
                });
            }

            // Return the full list as JSON.
            (OK_RESPONSE.to_string(), serde_json::to_string(&users).unwrap())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}



/// Handle a HTTP PUT /users/{id} request.
/// 
/// Expects:
/// - a user id in the request path
/// - a JSON body containing updated user fields (name, email)
/// Returns:
/// - (status_line, response_body)
fn handle_put_request(request: &str) -> (String, String) {

    // Get ID from URL, user payload from request, DB connection. 
    match
        (
            get_id(&request).parse::<i32>(),
            get_user_request_body(&request),
            Client::connect(DB_URL, NoTls),
        )
    {
        (Ok(id), Ok(user), Ok(mut client)) => {

            // Apply update for specific user ID.
            client
                .execute(
                    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
                    &[&user.name, &user.email, &id]
                )
                .unwrap();

            (OK_RESPONSE.to_string(), "User updated".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}



/// Handle a HTTP DELETE /users/{id} request
/// 
/// Expects:
/// - a user id in the request path
/// Deletes:
/// - the matching user row (if it exists)
/// Returns:
/// - (status_line, response_body)
/// 
fn handle_delete_request(request: &str) -> (String, String) {

    // Get user ID and DB connection.
    match (get_id(&request).parse::<i32>(), Client::connect(DB_URL, NoTls)) {

        (Ok(id), Ok(mut client)) => {

            // Execute delete. If rows affected is 0, user not found. 
            let rows_affected = client.execute("DELETE FROM users WHERE id = $1", &[&id]).unwrap();
            if rows_affected == 0 {
                return (NOT_FOUND.to_string(), "User not found".to_string());
            }
            
            (OK_RESPONSE.to_string(), "User deleted".to_string())
        }
        _ => (INTERNAL_ERROR.to_string(), "Internal error".to_string()),
    }
}