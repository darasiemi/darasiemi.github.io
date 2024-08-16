---
layout: page
title: Image Augmentation for Satellite Images
# description: with background image
img: assets/img/imagesatelliteproject.png
importance: 3
category: work
# related_publications: true
---

This study proposes the use of generative models (GANs) for augmenting the EuroSAT dataset for the Land Use and Land Cover (LULC) Classification task. We used DCGAN and WGAN-GP to generate images for each class in the dataset. We then explored the effect of augmenting the original dataset by about 10% in each case on model performance. The choice of GAN architecture seems to have no apparent effect on the model performance. However, a combination of geometric augmentation and GAN-generated images improved baseline results. Our study shows that GANs augmentation can improve the generalizability of deep classification models on satellite images.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/imagesatelliteproject.png" title="image augmentation archi" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Satellite augmentation project pipeline
</div>

[Project link](https://github.com/peter716/11785-Project)
