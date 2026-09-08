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

use imageproc::drawing::draw_text_mut;
use rusttype::{ Font, Scale};
use image::{DynamicImage, RgbImage, Rgb};

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

pub async fn qr_code_with_text(qr_payload: TicketQRData, text_data: TextData, font_path: &str) -> anyhow::Result<String> {
    // LOAD FONT.
    let font_data = fs::read(font_path)?;
    let font = Font::try_from_vec(font_data).expect("Invalid font");

    // LOAD LOGO
    let logo = image::open(logo_path)?.to_rgba8();
    let logo_width = 300;
    let logo_height = (logo_height_from_ratio(&logo, logo_width))?;
    let logo = image::imageops::resize(&logo, logo_width, logo_height, image::imageops::FilterType::Lanczos3);

    // QR GENERATION.
    let json_data = serde_json::to_string(&qr_payload)?; // Serialize ticket object to json
    let code = QrCode::new(&json_data)?;
    let qr = code.render::<image::Luma<u8>>().min_dimensions(300, 300).max_dimensions(300, 300).build();
    let qr_rgb: RbgImage = DynamicImage::ImageLuma8(qr).to_rgb8();


    // CANVAS SIZE COMPUTATION
    let padding = 20;
    let text_height = 40;
    let text_height_per_line = 40;
    let total_height = padding + logo.height() + padding + text_height_per_line * 4 + padding + qr_rgb.height() + padding;
    let width = 400;

    let mut canvas = RgbImage::from_pixel(
        width,
        total_height,
        Rgb([255, 255, 255]),
    );

    // OVERLAY QR(Paste qr)
    let image::imageops::overlay(&mut canvas, &qr_rgb, 0, 0);

    // DRAW Text
    draw_text_mut(
        &mut canvas, Rgb([0, 0, 0]), 10, qr_rgb.height() + 5,
        Scale::uniform(28.0), &font, text
    );

    // Encode PNG to bytes in memory.
    let mut bytes: Vec<u8> = Vec::new();
    DynamicImage::ImageRgb8(canvas).write_to(&mut Cursor::new(&mut bytes), image::ImageOutputFormat::Png)?;

    // Base64 encode for email attachment
    let base64_png_string = general_purpose::STANDARD.encode(&bytes);

    Ok(base64_png_string)
}
