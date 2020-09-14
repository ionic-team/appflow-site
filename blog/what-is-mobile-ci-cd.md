---
title: What is Mobile CI/CD?
description: Exploring what Mobile CI/CD is and how it differs from traditional CI/CD, and how Appflow is a leading Mobile CI/CD service.
slug: what-is-mobile-ci-cd
featuredImage: what-is-mobile-ci-cd.png
featuredImageAlt: figure 8 with phone in the middle on raised background
date: 2020-08-18 08:00:00
author: Max Lynch <max@ionic.io>
authorUrl: https://twitter.com/maxlynch
authorImageName: max-lynch.jpg
related:
  - https://ionicframework.com/resources/webinars/hybrid-app-development-redefined
  - https://useappflow.com/resources/solving-mobile-cicd-with-appflow
---

Continuous Integration and Continuous Delivery (CI/CD) is one of the fastest growing sectors of the developer market. Focused on enabling teams to continuously test and integrate their apps (instead of doing it all at once before shipping), and then helping teams deliver those apps in an automated fashion, CI/CD has transformed the way developers build and ship software.

A staple in the backend and, more recently, frontend ecosystems, CI/CD services have proliferated to help developers perform a set of tedious tasks on every commit to their app, including:

* Running builds every commit to every branch in a git repo
* Running test suites and tracking failing and succeeding tests
* Performing webhooks and other actions after builds
* Launching or deploying apps to hosting destinations after successful builds

This list applies to nearly every type of software application, whether it’s a backend, frontend web, or mobile app. This has led to a proliferation of general purpose CI/CD services that integrate with popular code repository hosting services, provide on-demand clean build infrastructure, and a system to trigger actions before and after builds.

<!--more-->

## What about Mobile CI/CD?

Mobile app development is one of the most complicated areas of software development when it comes to CI/CD solutions. Given that mobile apps utilize extensive native compilation, rigid operating system requirements, rigorous code signing, frequently-updated SDKs and tooling, complex operating system licensing, device testing, and app store submission, a CI/CD platform for mobile apps will need to have extra features to cover these unique demands.

A proper Mobile CI/CD setup will feature:

* Managed build environments for iOS, Android, and mobile web apps (for teams building Progressive Web Apps)
* Managed servers and server infrastructure for legal, licensed builds on macOS and Linux.
* Per-platform tooling: Xcode for iOS, Android SDK for Android, etc.
* Certificate and profile management for mobile code signing
* Deployment for web assets for hybrid mobile and Progressive Web Apps
* Multiple deployment channels to enable easy development, beta, and production tracks
* Automatic submission to Apple App Store and Google Play Store
* Frequent security patches and upgrades for safe builds on the latest Apple and Google approved tools and SDKs

These are specialized mobile tasks that most CI/CD services do not handle, so clearly mobile teams will need mobile-specific CI/CD services and infrastructure.

## What is Appflow?

[Appflow](https://useappflow.com/) is a leading Mobile CI/CD service focused entirely on the unique nature of mobile app development, testing, and delivery. Appflow powers Mobile CI/CD at companies like Burger King, AAA, BCBS, and more. And Appflow is a major part of the Ionic app platform, a set of mobile-focused tools with millions of users and hundreds of major enterprise customers, which powers a significant portion of the Apple App Store and Google Play Store.

Appflow provides fully managed build environments for iOS, Android, and Progressive Web Apps by offering genuine macOS build servers for iOS and Linux for Android and Web apps.

Appflow manages signing certificates for apps and enables direct publishing of built apps to the Apple App Store and Google Play Store.

For teams building hybrid apps using Capacitor or Cordova (including users of Ionic Framework), Appflow offers some additional features such as the ability to live-update web assets in an app remotely. This means a hybrid app in the app stores can be updated in realtime for changes at the web app layer.

Appflow has a powerful channel system where builds and deployments can be performed across an arbitrary number of environments to enable easy development, alpha/beta, and production builds.

Finally, Appflow offers a flexible automation layer across all of these features for the easy creation of complex workflows and integrating with third party services through webhooks.

## When do you need a Mobile CI/CD Solution?

For teams building and deploying app store apps, a Mobile CI/CD solution is critical. We work with many teams that are new to mobile and are bringing their existing backend or frontend CI/CD experience to mobile and struggling to adapt to the massive difference in complexity and tooling requirements for Mobile CI/CD.

It’s simply not feasible for most teams to build or run their own Mobile CI/CD infrastructure, and it’s likely not feasible for teams to add Mobile CI/CD functionality to an existing general purpose CI/CD service like Circle CI, GitHub Actions, or Azure’s various CI/CD offerings. That’s because doing so would require a full time team to build, manage, and keep updated every aspect of the Mobile CI/CD feature set described earlier. Also, the skills needed to build and maintain CI/CD infrastructure are very different from the skills needed to build frontend and mobile apps, so teams would need to hire outside of their team’s core competency.

## Getting Started with Appflow

We encourage your team to explore the Mobile CI/CD space before making a decision on a platform. Appflow is a great choice for fast-growing startups and SMBs all the way up to the Fortune 1000, with plenty of enterprise-specific features for mission critical apps.

Getting started with Appflow is free. Go to [useappflow.com](https://useappflow.com/), create a free account, and connect your app. Explore the [Appflow Documentation](https://ionicframework.com/docs/appflow) to see the full feature set of Appflow and integrate those features into your apps.

The Appflow team are also experts in Mobile CI/CD and are available for consultation to help your team build out a winning Mobile CI/CD strategy. Please [get in touch with the team](https://ionicframework.com/enterprise/contact) to see how Appflow and Mobile CI/CD can help your team move faster and ensure quality throughout the app development lifecycle.