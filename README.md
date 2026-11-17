# Aai

Aai is a small tribute to Mom. Two square views share one illustrated scene or webcam feed. One can show an illustrative central patch. The progression control changes its strength; the glasses toggle removes a separate focus blur from both views. These controls do not represent a person's prescription, diagnosis, or clinical timeline.

Camera frames are drawn locally on canvas, with no recording or upload. No microphone permission is requested.

## Run locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open http://localhost:8000 in a browser. Camera access requires a secure context (HTTPS or localhost).

## Host on GitHub Pages

In **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/docs**, and save. The site has no dependencies or build step.
