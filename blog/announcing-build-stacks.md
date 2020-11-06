---
title: Announcing Build Stacks
slug: announcing-build-stacks
description: Greater control over cloud build environments unlocks better native build stability and easier troubleshooting.
date: 2020-11-02 08:00:00
author: Matt Kremer <matt@ionic.io>
authorUrl: https://twitter.com/matthewkremer
authorImageName: matt-kremer.jpg
featuredImage: build-stacks.png
featuredImageAlt: Build Stacks
---

Today I’m thrilled to announce the release of Build Stacks in Appflow. With this exciting new feature, Appflow users now have much greater control over their cloud build environments to unlock better native build stability and easier troubleshooting.

To view all available Build Stacks, refer to [the Appflow docs](https://ionicframework.com/docs/appflow/build-stacks) or create a new native build within Appflow.

<!--more-->

## More Transparent Build Configurations

A Build Stack is a collection of software tooling used to build native iOS and Android apps on Appflow, including the Cordova CLI, Capacitor CLI, Ionic CLI, Node, CocoaPods, Gradle, and more. Here’s the latest iOS Build Stack, which uses macOS to build the native app:

![iOS Build Stacks](/assets/blog/img/build-stacks-ios.png)

And Android, which uses Linux to build the native app:

![Android Build Stacks](/assets/blog/img/build-stacks-android.png)

These build configurations were available previously, but this update explicitly lists the exact versions in use. 
 
## Why Build Stacks?

As you can see, there are a lot of tools and dependencies required to build and maintain native iOS and Android apps. The mobile development ecosystem moves quickly, so keeping dependencies up to date is important. In an ideal world, everyone would stay up to date with the latest and greatest updates, security patches, and new features. However, that’s easier said than done - the risk of something breaking is very high, which takes attention away from what matters most: delivering features and value unique to your business.

The introduction of Build Stacks mitigates a lot of the risk of updating your native build tooling. The Appflow team verifies each Build Stack extensively before releasing it, ensuring better native build stability for all types of mobile apps. By matching their local development environment with Appflow, dev teams can improve their delivery speed while remaining confident that the cloud build infrastructure they depend on meets their specific requirements. Should a build failure arise, it’ll be easier to troubleshoot.

Internally, the Appflow team has made a number of infrastructure improvements to the Build Stack architecture. This means Appflow can support a wider variety of tooling configurations, and release them faster, such as when new iOS or Android versions are released. 

## Choose when to update

Generally, the latest Build Stack is the best choice for most apps. However, you’re able to choose the best Build Stack for your apps, such as when a specific version of a build tool is required like an older version of Xcode or the Gradle.

After a new Build Stack becomes available, older ones may be retired. They’ll be labeled with the retirement date within the native build screen in Appflow, and customers will be notified by email.

To view all available Build Stacks, refer to [the Appflow docs](https://ionicframework.com/docs/appflow/build-stacks) or create a new native build within Appflow. Build stacks are available for use with Appflow plans that include [cloud native build functionality](https://ionicframework.com/pricing).

## Select your Build Stack of Choice Today

It’s easy to test a new Build Stack before committing to it. Create a new native build and select the desired Build Stack. If it builds then runs successfully on your device(s), you can confidently select that Stack for all subsequent native builds. If your team uses the [Automation feature](https://ionicframework.com/docs/appflow/automation/intro), the Build Stack can be automatically applied to all new native builds going forward.

Log into Appflow and select the best Build Stack for your apps today.

## Special note for Automation users

Using Appflow’s [Automation feature](https://ionicframework.com/docs/appflow/automation/intro)? On November 16th, 2020, the `macOS - 2020.11` Build Stack will become the default Stack for iOS apps. Currently, the default is `macOS - 2020.06`.

If you’d like to remain on `macOS - 2020.06` (or another Stack), please log into Appflow then explicitly choose it via the “Specify a build stack” option:

![Appflow Automations and Build Stacks](/assets/blog/img/build-stacks-automation.png)
