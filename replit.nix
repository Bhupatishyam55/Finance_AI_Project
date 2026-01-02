{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.tesseract
    pkgs.poppler_utils
    pkgs.ffmpeg
    pkgs.libglvnd
  ];
}
