---
layout: page
title: UCC AI Quest 2023 — Vegetation Patch Segmentation
img: assets/img/ucc-ai-quest-schematic.svg
importance: 3
category: hackathons
---

The inaugural **UCC AI Quest 2023** challenged teams to build AI for climate action: specifically, **semantic segmentation of vegetation patches from high-resolution drone images of Irish landscapes**, scored on intersection-over-union (IoU). Our team placed as finalists in the vegetation patches image segmentation task.

<div class="row justify-content-sm-center">
    <div class="col-sm-11 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/ucc-ai-quest-schematic.svg" title="UCC AI Quest segmentation pipeline and model" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The pipeline moves aerial image–annotation pairs through **data pre-processing** (augmentation and normalization), **training with validation**, and finally **testing**. On the augmentation side we leaned on random crop, JPEG compression, shift-scale-rotate, horizontal and vertical flipping, hue-saturation-value jitter, and Gaussian blur to make the model robust to the variability of drone capture.

The model is **DeepLabV3 with a ResNet101 backbone**. The gains that mattered most came from the add-ons: a learning-rate scheduler, in-pipeline JPEG compression, customised normalization statistics for the drone imagery, and a learning-rate / batch-size finder to pick training hyperparameters directly instead of guessing. Along the way we also explored **U-Net and FCN** (ResNet50 and ResNet101 backbones), batch sizes of 8, 16, 32, both Adam and AdamW optimizers, and 224 × 224 input resizing.

Code: [View on GitHub](https://github.com/darasiemi/UCC-AI-Hackathon).
