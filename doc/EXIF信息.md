# EXIF 信息

## 功能概述
查看照片里的拍摄参数和 GPS，并下载一份去掉元数据的副本。

## 关键技术栈
- exifr 读取
- `src/lib/metadata.ts` 去掉 JPEG 的 APP/COM 段和 PNG 的文本块

## 关键组件
- `ImageExif.vue`
- `stripImageMetadata`

## 实现思路
JPEG 保留 SOS 之后的图像数据，删掉前面的元数据段。PNG 去掉 eXIf、tEXt、iTXt、zTXt。其他格式如果无法按字节清理，就用 canvas 重新导出 PNG。

## 功能总结
分享照片前可以先看清定位，再拿走这些信息。
