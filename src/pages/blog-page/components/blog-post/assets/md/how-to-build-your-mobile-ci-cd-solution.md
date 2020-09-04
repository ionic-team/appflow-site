---
title: Building a robust Mobile CI/CD pipeline on Jenkins/Circle CI/Azure/etc.
description: What does it take to build a scalable, robust Mobile CI/CD pipeline on popular services such as Jenkins, Circle CI, or Azure DevOps?
slug: how-to-build-your-mobile-ci-cd-solution-on-jenkins-circleci-azure-devops
date: 2020-08-18 15:00:00
author: Max Lynch <max@ionic.io>
authorUrl: https://twitter.com/maxlynch
authorImageName: max-lynch.jpg
---

Enterprise teams building mobile apps are looking to add Mobile CI/CD capabilities to their existing CI/CD workflows in use for their backend and frontend web apps.

Teams running or using Jenkins, Circle CI, Azure or AWS CI/CD solutions, and more, often ask how they can start to continuously build, test, and deploy their mobile apps utilizing their existing CI/CD investments.

While it’s possible to do so, it’s important to understand the aspects that make Mobile CI/CD uniquely challenging, and why there’s a good chance your team should buy rather than build their own solution for mobile builds.

Before jumping in, if you’re new to Mobile CI/CD, take a look at our introduction to Mobile CI/CD to understand what tasks are required to build, test, and deploy mobile apps in a continuous fashion.

With that in mind, what would a team need to build in order to add Mobile CI/CD capabilities to their existing CI/CD service and workflows?

<!--more-->

## Step 1: Integration with Git provider

A source code repository is the central point for any app, so a Mobile CI/CD workflow will need to connect and integrate with your source repository host.

Depending on your provider, this could mean integrating with GitHub Enterprise, GitLab Enterprise, BitBucket, Azure/AWS code hosting, or another popular provider.

## Step 2: Trigger builds on commits

Once a connection has been made to your source code repository, a system needs to be set up to trigger builds on each commit, across all branches in your project. That means integrating with the API for the given provider, handling web hooks on commits, and then processing the updated code to perform builds.

## Step 3: Run iOS and Android Build Infrastructure

To perform builds, specialized infrastructure needs to be set up to enable iOS and Android builds at the very least, and possibly builds for web if building Progressive Web Apps or hybrid apps (Ionic/Capacitor, Cordova, React Native, etc).

For iOS, this means running genuine, legal Mac hardware with updated versions of macOS. Running Mac servers is not straightforward as it’s not as easily or legally virtualized as Linux. Teams will need to run physical mac hardware (such as Mac minis or Macbook Pros) which means data center colocation.

These servers then need to be orchestrated, routinely patched for security issues, kept up to date with yearly mobile OS and SDK updates.

## Step 4: Make that infrastructure scalable and flexible

Of course, running the server infrastructure for mobile builds is just one piece of the infrastructure puzzle. Mobile builds are resource-intensive, so teams will need to invest in making server resources elastic and scale to meet build demand. This will keep engineers productive and help them avoid wasting valuable time waiting for someone else’s build to finish.

## Step 5: Manage certificates

Mobile build tooling requires extensive code signing, which means managing extremely sensitive signing credentials and certificates.

A Mobile CI/CD solution will need a powerful certificate management system that keeps certificates encrypted and secure until needed for code signing.

## Step 6: For Hybrid apps, enable remote deploys

Developers of hybrid apps, such as those built with Ionic Framework, Capacitor, Cordova, and React Native, expect to be able to update the web code of their apps remotely and in realtime. That means being able to push fixes and updates without needing to resubmit to the app stores.

A proper Mobile CI/CD solution for these teams will come with remove deploy features to give these developers the agility they expect.

## Step 7: Set up infrastructure to manage development, beta, and production channels

Mobile app teams need to deploy different versions of their app to different people, whether those are beta testers, coworkers, stakeholders, or customers.

For beta testing, teams will need to submit those apps to testing tools such as Testflight.

Many mobile teams utilize homegrown versioning to build beta, testing, and production versions of their app. A Mobile CI/CD solution will need a way to support this use case.

## Step 8: Automatically deploy apps to Apple App Store and Google Play Store

One of the most time consuming and frustration inducing aspects of mobile development is uploading and publishing apps to the Apple App Store and Google Play Store.

Thankfully, these steps can be automated with sufficiently advanced tooling. Mobile CI/CD solutions will likely offer the way to automatically upload builds to the app stores to avoid this tedious process.

## Step 9: Support multiple “build stacks” for different app OS/SDK version requirements

Many apps have different mobile OS and tooling version requirements. Those apps will need to have some control over which version of tools like Xcode, macOS, etc they build on.

A proper Mobile CI/CD solution will enable some control over the build stack for an app.

## Step 10: Set up process to upgrade and security patch operating systems, servers, tooling, and more

A cornerstone of mobile is the (at least!) yearly OS and device refresh and launch cycle.

Mobile tooling changes rapidly, far more so than typical backend or frontend environments. New versions of iOS and Android are released, along with new device features, and corresponding API, build tooling, and OS upgrade requirements.

This means teams need to frequently upgrade servers, operating systems, and build environments.

This is in addition to the typical work of patching operating systems and tooling for security issues which is a full time job.

Mobile CI/CD platforms will upgrade their build environments frequently, and patch security flaws on a constant basis.

## Step 11: Provide a nice UI for the above features

Beyond infrastructure, many of the above processes require UI for users to setup, configure, and monitor their builds. 

It’s likely this UI will need to be built as general purpose CI/CD tooling does not typically have the above features for mobile builds.

## Hiring to build Mobile CI/CD infrastructure

One thing you’ll note about the above steps is they require a different type of engineering skill than the mobile team has, so your team will need to find a way to hire backend engineers, server administrators, data center administrators, and DevOps engineers.

For running iOS build infrastructure, teams will also need unique macOS server administrators which is a pretty rare skill as macOS is very rarely used as server infrastructure.

## What about an off-the-shelf solution?

Many mobile teams, when faced with the requirements needed to build scalable, reliable, and secure Mobile CI/CD infrastructure for their mobile apps, realize they would be better served buying an off-the-shelf solution instead of building their own.

The Mobile CI/CD market has a number of companies providing their solution to the challenges of Mobile CI/CD.

One of the leaders is [Appflow](https://useappflow.com/), created by the [team](https://ionic.io/) behind [Ionic Framework](https://ionicframework.com/). Appflow is used by thousands of companies and a significant portion of the Fortune 1000, helping teams like Burger King, AAA, and Shipt ensure mobile app quality and ship at the speed of development.

The Appflow team features some of the leading experts in mobile and backend build infrastructure, and hires for unique experience that mobile teams likely do not have (or need!), so your team does not. The team has spent years building solutions to the above problems and is focused exclusively on providing a Mobile CI/CD solution to teams and enterprise users.

## Conclusion

Mobile CI/CD is considerably more complex than traditional CI/CD, and requires specialized skills, server infrastructure, and features. While it’s possible for mobile teams to build their own Mobile CI/CD on top of general purpose CI/CD tooling such as Jenkins or Circle CI, doing so requires a massive investment and hiring for rare engineering skills.

Generally, teams will want to purchase an off-the-shelf, Mobile-specific solution such as [Appflow](https://useappflow.com/) so they can focus on what they do best: building a great mobile experience.

