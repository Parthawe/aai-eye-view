# Aai

Aai is a small tribute to Mom. Two square views share one illustrated scene or webcam feed. The left view shows heavy blur. The right view preserves more detail around a dark central spot. The progression control changes the strength of the spot, and the glasses toggle adjusts focus. Both controls are illustrative.

Camera frames are drawn locally on canvas, with no recording or upload. No microphone permission is requested.

## Run locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open http://localhost:8000 in a browser. Camera access requires a secure context (HTTPS or localhost).

## Host on GitHub Pages

In **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/docs**, and save. The site has no dependencies or build step.
