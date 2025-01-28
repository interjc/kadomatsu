#!/bin/bash

# 检查是否安装了 FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "错误：未安装 FFmpeg。请先安装 FFmpeg。"
    echo "可以使用 brew install ffmpeg 进行安装"
    exit 1
fi

# 检查输入参数
if [ "$#" -ne 1 ]; then
    echo "使用方法: ./start.sh <媒体文件路径>"
    exit 1
fi

input_file="$1"
output_file="${input_file%.*}_compressed.mp3"

# 检查输入文件是否存在
if [ ! -f "$input_file" ]; then
    echo "错误：输入文件 '$input_file' 不存在"
    exit 1
fi

# 检测文件类型和音频码率
file_type=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "$input_file")
audio_bitrate=$(ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "$input_file")

# 将音频码率转换为kbps
audio_bitrate_kbps=$((audio_bitrate / 1000))

if [ "$file_type" = "video" ]; then
    echo "检测到视频文件，正在提取并处理音频..."
    # 提取音频，如果码率低于32k则直接复制
    if [ "$audio_bitrate_kbps" -le 32 ]; then
        echo "音频码率已经足够低，直接提取..."
        ffmpeg -i "$input_file" -vn -c:a copy "$output_file"
    else
        echo "压缩音频..."
        ffmpeg -i "$input_file" -vn -c:a libmp3lame -b:a 32k -ac 1 "$output_file"
    fi
else
    echo "检测到音频文件，正在处理..."
    # 如果码率低于32k则直接复制
    if [ "$audio_bitrate_kbps" -le 32 ]; then
        echo "音频码率已经足够低，直接复制..."
        ffmpeg -i "$input_file" -c:a copy "$output_file"
    else
        echo "压缩音频..."
        ffmpeg -i "$input_file" -c:a libmp3lame -b:a 32k -ac 1 "$output_file"
    fi
fi

if [ $? -eq 0 ]; then
    echo "处理完成！"
    echo "输出文件：$output_file"
else
    echo "处理过程中发生错误"
    exit 1
fi
