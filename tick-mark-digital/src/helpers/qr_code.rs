//! QR code genrator
use serde::{Serialize, Deserialize};
use image::{Luma, ImageBuffer, ExtendedColorType};
use image::codecs::png::{PngEncoder, CompressionType, FilterType};
use image::ImageEncoder;
use base64::engine::general_purpose::STANDARD;
use base64::Engine as _;
use qrcode::render::svg;
use qrcode::QrCode;
use std::io::Cursor;
use std::fs;

use crate::models::{ TickType, TickClass };

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketQRData {
    pub order_id: String,
    pub entrance_code: String,
    pub organization_id: String,
    pub event_id: String,
    pub ticket_type: String,
    pub ticket_status: String,
    pub start_time: String,
    pub finish_time: String,
    pub paystack_reference: String,
    pub ticket_id: String,
}

pub async fn qr_code_gen(qr_payload: TicketQRData) -> Result<String, Box<dyn std::error::Error>> {
    // Serialize ticket object to json
    let json_data = serde_json::to_string(&qr_payload)?;
    // Create QR code from json string.
    let qr_c = QrCode::new(&json_data).unwrap();
    let image: ImageBuffer<Luma<u8>, Vec<u8>> = qr_c.render::<Luma<u8>>().build();
    // Encode QR as PNG bytes.
    let mut png_bytes = Vec::new();
    {
        let mut cursor = Cursor::new(&mut png_bytes);
        let encoder = PngEncoder::new_with_quality(&mut cursor, CompressionType::Best, FilterType::NoFilter);
        encoder.write_image(&image, image.width(), image.height(), ExtendedColorType::L8).unwrap();
    }
    // Base 64 encode string.
    let png_base64_string = STANDARD.encode(png_bytes);
    Ok(png_base64_string)
}
