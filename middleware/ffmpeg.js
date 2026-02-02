const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const fs = require('fs');
const { bucket } = require('../bucketClooud');


const fFmpegFunction = (filename, tempFilePath, timePosition) => {
  return new Promise((resolve,reject)=>{
    try {
      ffmpeg(tempFilePath)
        .screenshots({
          timestamps: [timePosition],
          filename: filename,
          size: "150x100",
        })
        .on("end", async () => {
          resolve()
          // Clean up temporary files
        })
        .on("error", (error) => {
          console.log(error);
          reject()

        });
    } catch (error) {
      console.log(error);
    }
  })
  };


// دالة لضغط الفيديو باستخدام ffmpeg
const compressVideo = (inputPath, outputPath, maxSizeMB=150) => {
  return new Promise((resolve, reject) => {
  //   ffmpeg(inputPath)
  //   .output('../tmp')
  //   .videoCodec('libx264')
  //   .size('1280x720') // تقليص الحجم
  //   .on('end', () => resolve('../tmp'))
  //   .on('error', err => reject(err))
  //   .run();
    // الحصول على مدة الفيديو
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration; // مدة الفيديو بالثواني
      const targetSizeBytes = maxSizeMB * 1024 * 1024; // الحجم المطلوب بالبايت
      const targetBitrate = (targetSizeBytes * 8) / duration; // حساب معدل البت المناسب

      // console.log(`Target bitrate: ${targetBitrate / 1000} kbps`);

      // استخدام معدل البت لتقليص حجم الفيديو
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('128k')
        .videoBitrate(targetBitrate) // تعيين معدل البت
        .size('640x360') // تقليص الأبعاد لتحسين الجودة
        .on('end', () => resolve(outputPath))
        .on('error', err => reject(err))
        .run();
    });
  });
};


  const processAndUpload = async (inputFilePath,TEMP_UPLOAD_DIR) => {
    try {

      await compressVideo(inputFilePath, TEMP_UPLOAD_DIR);
      // رفع الملف المضغوط إلى S3
      await bucket.upload(inputFilePath);
      fs.unlinkSync(inputFilePath);

    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

// console.log(ffmpegInstaller.path, ffmpegInstaller.version);

module.exports = {fFmpegFunction,processAndUpload};
