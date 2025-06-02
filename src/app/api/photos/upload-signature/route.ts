import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { folder = 'party-moments' } = body;

    // Check if this is an unsigned upload preset
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    // For unsigned uploads, we don't need API credentials
    // Just return the basic info needed for the upload
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Using unsigned upload preset:', uploadPreset);
      return NextResponse.json({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        upload_preset: uploadPreset,
        folder,
      });
    }

    const timestamp = Math.round((new Date).getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        upload_preset: uploadPreset,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
      upload_preset: uploadPreset,
    });
  } catch (error) {
    console.error('Virhe upload-allekirjoituksen luonnissa:', error);
    return NextResponse.json(
      { error: 'Virhe upload-allekirjoituksen luonnissa' },
      { status: 500 }
    );
  }
}