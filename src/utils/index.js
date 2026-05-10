export function getImageUrl(picPath) {
    if (!picPath) return "";
    if (/^(https?:)?\/\//.test(picPath) || picPath.startsWith("/")) return picPath;
    try {
        return require(`@/${picPath}`);
    } catch (e) {
        console.error(`Image not found: ${picPath}`, e);
        return ""; // 返回空字符串或其他默认图片路径
    }
}
export function getVideoUrl(videoPath) {
    if (!videoPath) return "";
    if (/^(https?:)?\/\//.test(videoPath) || videoPath.startsWith("/")) return videoPath;
    try {
        return require(`@/${videoPath}`);
    } catch (e) {
        console.error(`Video not found: ${videoPath}`, e);
        return ""; // 返回空字符串或其他默认图片路径
    }
}