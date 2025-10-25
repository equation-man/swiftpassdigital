// Messaging module.
use reqwest::Error;
use serde::{ Deserialize, Serialize };
use serde_json::{json, Value};
use chrono::{DateTime, Local, Utc};
use dotenvy::dotenv;
use std::env;

#[derive(Deserialize, Serialize, Debug)]
pub struct BrevoResponse {
    pub messageId: String,
}

pub async fn mail_cred() -> (String, String) {
    dotenv().ok();
    let mail_url = env::var("MAIL_SENDER_API").expect("Mail server url");
    let api_key = env::var("MAIL_SENDER_API_KEY").expect("API token key");
    (mail_url, api_key)
}

/// Format email html message.
pub async fn parse_email_html_content(entrance_code: String, ticket_status: String, title: String, start: String) -> String {
    let dt: DateTime<Utc> = start.parse().unwrap();
    let local_dt = dt.with_timezone(&Local);
    let human = local_dt.format("%A, %b %d %Y %I:%M %p").to_string();
    format!(r#"
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
                <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <h2 style="color: #333;">SwiftPassDigital Ticket Confirmation</h2>
                      <h3 style="color: #333;">{}</h3>
                      <p>Event date: <time ditetime="{}">{}</time></p>
                      <p>Your can download or screenshot the QR code file to be presented at the gate has been attached in this email</p>
                      <p style="font-size: 18px; color: #333; margin-top: 20px;">Ticket Code:</p>
                      <div style="font-family: 'Courier New', monospace; font-size: 28px; letter-spacing: 2px; font-weight: bold; color: #0078d4; background: #f0f0f0; display: inline-block; padding: 12px 24px; border-radius: 6px; margin: 10px 0;">
                      {}
                      </div>
                      <p style="font-size: 18px; color: #333; margin-top: 20px;">Status: {}</p>

                      <p style="color: #777;">This ticket is only valid during the event period, and should be presented at the venue entrance. Refunds are not possible.</p>
                      <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
                    </td>
                  </tr>
                </table>
              </body>
            </html>
        "#, title, start, human, entrance_code, ticket_status)
}

/// Sending emails.
pub async fn send_email(from: String, to: String, subject: String,
    target_name: String, target_qr_attachment: String, text: String,
    html: Option<String>) -> Result<BrevoResponse, Error> {
    let ( email_url, api_key ) = mail_cred().await;
    let payload = json!({
        "sender": {"name": "SwiftPassDigital", "email": &from},
        "to": [{"name": &target_name, "email": &to}],
        "subject": &subject,
        "textContent": &text,
        "htmlContent": Some(html),
        "attachment": [
            {
                "content": target_qr_attachment,
                "name": "swpd_ticket_qr.png",
                "contentId": "swpd_ticket_qr",
                "mimeType": "image/png",
            }
        ]
    });
    let client = reqwest::Client::new();
    let res = client.post(format!("{}/v3/smtp/email",&email_url))
        .header("accept", "application/json")
        .header("Content-Type", "application/json")
        .header("api-key", &api_key)
        .json(&payload)
        .send().await?;
    let resp: BrevoResponse = res.json().await?;
    Ok(resp)
}

#[cfg(test)]
mod tests {
    use super::*;

    // =========== TEST READING ENVIRONMENT =================
    #[tokio::test]
    #[ignore]
    async fn test_mail_cred() {
        let creds = mail_cred().await;
        println!("The email api credentials are {:#?}", creds);
    }

    #[tokio::test]
    #[ignore]
    async fn test_send_mail() {
        //let from = "swiftpassdigital@drugsverse.com".to_string();
        //let to = "bigtechguyz@gmail.com".to_string();
        //let target_name = "Big Tech".to_string();
        //let subject = "SwiftPassDigital event ticket".to_string();
        //let text = "Your event spot has been secured successfully via SwiftPassDigital. Your ticket id is: #89341. Enjoy your event. ".to_string();
        //let html = parse_email_html_content("SWP-UTYX4572".to_string(), "Pending".to_string(), "SwiftPassDigital".to_string(), "2025".to_string()).await;
        //let email_sent = send_email(from, to, subject, target_name, text, Some(html)).await;
        //println!("The email send response is {:#?}", email_sent);
    }
}
