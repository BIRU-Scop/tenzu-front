# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.0-staging.10](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.9...v0.1.0-staging.10) (2025-01-14)


### Features

* move config file to configs folder to mount the entire directory on kubernetes ([c718346](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c7183461fbf8cdf23ff1f89390a4afc58d566199))

## [0.1.0-staging.9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.8...v0.1.0-staging.9) (2025-01-14)

## [0.1.0-staging.8](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.7...v0.1.0-staging.8) (2025-01-14)


### Features

* add config-app service to load app configuration ([0686f9f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/0686f9f689e0a969dc70fc8f75e874c75323cc2b))
* add KanbanWrapperComponent and related services ([679376f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/679376fdd83006f7438dd35b1af5d4170c5602a0))
* change token key for access token ([e4d87f4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e4d87f4e4b5208dc4fe3ce685e90529f5bc00aa7))
* dynamic change of auth layout display depending on child form errors ([7de5410](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7de54109e43eaaf4c9da8b6ee5f16936609f0d7d))
* enhance Caddyfile with caching and encoding updates ([78e0da9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/78e0da9aedf9cc846c261269e9987cf0ef8d9605))
* implement OnDestroy for cleanup in workspace components ([add1638](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/add163897d83ea9b1ebca17c8270a307cec0e665))
* improve story details three views style ([90b0d6a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/90b0d6a841cf9e48d12d50c88b2c03f34951074f))
* **kanban:** implement virtual scrolling for stories list ([25b1c98](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/25b1c98896c58c351b2e990dbd299a4c1f1b7108))
* **router:** implement custom route reuse strategy ([ffe6c0e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ffe6c0e0dfc371e50540db3d6d60158a7c009794))
* **story-detail-menu:** add new story detail menu component ([25296d4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/25296d455aa418031df44ec82be85332b328d51e))
* **story:** add project and workflow tracking in store ([2a42154](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/2a421546f18f6d14799c8948f9639b27c07580ff))
* switch to v1 of API ([ca82cb5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ca82cb5d8b6043a92980217ceb63596fa216c9b0))
* use configAppService everywhere needed ([10af912](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/10af912894e9af57f0be450f9e43d960a963a115))
* **workflow:** implement caching ([5d9bd65](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5d9bd6561398eadcf8ca2c1d1aae89e32e17c5ef))


### Bug Fixes

* add linting fix and missing zod dependency ([9542d32](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/9542d324ae9d7def3244fa30d977cc338008ff29))
* ensure workflows exist before rendering sidenav content ([ffcd18c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ffcd18cabd9c7455d37fa357e284123daa7154c7))
* fix some bug introduced by ngrx/signal v19 ([92c5f3a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/92c5f3a77b49ee3c72fa78e84f035ddab513117d))
* prevent crash on bad validators argument ([e73c769](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e73c76995d73bd6b17a1cd512efea2f12d8e1ba3))
* prevent infinite loop when refresh token is expired ([50912b6](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/50912b662de13251f1decac35a2b07c02efe1b64))

## [0.1.0-staging.7](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.6...v0.1.0-staging.7) (2024-12-03)


### Bug Fixes

* handle null workflow in story detail subscription ([a3d2d21](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a3d2d2116553c63780fd480e315a8201e77036de))

## [0.1.0-staging.6](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.5...v0.1.0-staging.6) (2024-12-03)


### Bug Fixes

* **story-detail:** handle null workflow gracefully ([df9db0f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/df9db0f65ac79f8b690a276b7f7fe35cacc08cc1))

## [0.1.0-staging.5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.4...v0.1.0-staging.5) (2024-12-03)


### Bug Fixes

* fix interceptor ([23de1d4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/23de1d41eb8eca815871724bc1b96f7ab894bdd4))

## [0.1.0-staging.4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.2...v0.1.0-staging.4) (2024-12-03)


### Features

* style badge tooltip and slide toggle ([af91a08](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/af91a080d7bd2b48f1c5661c1fcdc3778ce0826d))


### Bug Fixes

* bump version ([b5f32bf](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b5f32bffdca3c3557168e0655bd24ebc65ac13b6))
* error with logout event ([dff4186](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/dff41865eb514cd9ed6cbbc61230f695fdd078ae))

## [0.1.0-staging.3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.2...v0.1.0-staging.3) (2024-12-03)


### Features

* style badge tooltip and slide toggle ([af91a08](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/af91a080d7bd2b48f1c5661c1fcdc3778ce0826d))


### Bug Fixes

* error with logout event ([dff4186](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/dff41865eb514cd9ed6cbbc61230f695fdd078ae))

## [0.1.0-staging.2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.1...v0.1.0-staging.2) (2024-12-03)

## [0.1.0-staging.1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.0...v0.1.0-staging.1) (2024-12-02)

## [0.1.0-staging.0](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.13...v0.1.0-staging.0) (2024-12-02)


### ⚠ BREAKING CHANGES

* remove unused utility files

* remove unused utility files ([8a5ea6f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8a5ea6f2b38731d5c7e16c0703669f2ea9b2d030))


### Features

* create new tw like classes ([62886c2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/62886c2f19149e61d9259d0a3b99dc0b345aefd0))
* **story-detail:** add MatTooltip and RouterLink imports ([cc9bf04](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cc9bf04be034fa20fe53115e4f65d15827c83f32))
* use new material tokens ([28802a2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/28802a2a7c304635425c7b2d3fde17934688ff38))


### Bug Fixes

* append query parameter for story attachment URL ([201c325](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/201c325d4e34f6795b504eb68795271c25155fd9))
* **workflow:** implement resetSelectedEntity method ([7d5229a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7d5229abbe3ac96c45291534193078466e0d6f9a))

## [0.0.1-staging.13](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.12...v0.0.1-staging.13) (2024-12-01)

## [0.0.1-staging.12](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.11...v0.0.1-staging.12) (2024-12-01)


### Features

* **story:** add story prev and next navigation ([4e43a54](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4e43a5462686dff09df2bb8a0a61555e56e1e365))


### Bug Fixes

* add workflow scope to workspace route ([00116d2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/00116d2cad6a9afbc39e054435905cf6d3944934))
* clear sixth level breadcrumb on story detail ([d2432a4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d2432a4aaecbd1da7478eea19903d8c031153ef7))
* guard story assignment actions with existence checks ([7c0e60c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7c0e60c630819036fc1639427f2a56a1838d04fa))
* improve notification display logic and formatting ([680e859](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/680e859cbdf94b71644d95b2c8e5f15c80c1cb1c))

## [0.0.1-staging.11](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.10...v0.0.1-staging.11) (2024-11-27)

## [0.0.1-staging.10](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.9...v0.0.1-staging.10) (2024-11-27)

## [0.0.1-staging.9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.8...v0.0.1-staging.9) (2024-11-27)


### Features

* **ws.service:** manage WS event subscriptions dynamically ([7d5c6b9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7d5c6b9a6f18ed1091a2e4c3af01934f8edf2a1b))

## [0.0.1-staging.8](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.7...v0.0.1-staging.8) (2024-11-27)


### Features

* add package-lock.json file ([987d2c3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/987d2c3cd9e5257f4997edbcb6133c706ae36a13))
* **ws.service:** enhance WebSocket service with detailed logging ([653a58e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/653a58e3571aa84918c705f00832ec79c9fc16a1))

## [0.0.1-staging.7](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.6...v0.0.1-staging.7) (2024-11-26)

## [0.0.1-staging.6](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.5...v0.0.1-staging.6) (2024-11-26)


### Features

* Add 404 error handling and page component ([100f461](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/100f4610d1134351d9399a0818ce733d71bb435b))
* add auto position for relative dialog ([b85c710](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b85c7104c3aa165ed09f47aab412da8d7f6c142f))
* add automatically generated dark theme ([c709921](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c709921ee7b1f2a8a77f1d593ee08533cf2078cf))
* add create StoryAssigment Event ([cdbd494](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cdbd4949289ef8619dafa79453c4564afb5e9610))
* add create workflow Event ([50dbd8c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/50dbd8c8b9d4e4148188cbbe18f471388dcbedf4))
* add events status realtime ([c203e4f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c203e4f4105793a5232246206a93832402e0efbe))
* add move to another workflow button ([3f40bd4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/3f40bd464ae0b190b2aff5b743575bbfccb6f009))
* add new enum types for project and workspace events ([879ed64](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/879ed64b78752666e39d5f95f0d7f2dc79107810))
* add notification event handling ([ad4bbb4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ad4bbb431b57222c89ef9f73dd4bc9f11e80dc49))
* add notification for the delete story event ([0ec02f2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/0ec02f2b1f9d805d2a16646266a692c629f6a8f2))
* add notifications feature ([04a00ed](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/04a00ed845cf3fa0d2b27f3fbffdbe300a4357d8))
* Add project delete event handling and notification ([37d7030](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/37d70307b056b2d30147bd7bc811afd63e8e630f))
* add reset selected entity method to the store ([894d6c1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/894d6c10445e4991225eefde3c12b8684e1c81b2))
* Add SafeHtmlPipe to sanitize HTML content in notifications ([2569084](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/2569084c5f6d1619818af51cbb0fd116b3250724))
* add story event ([f0fe548](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/f0fe5485d65b27537d6263efd7b3a3865b190a91))
* add StoryAttachment Event ([b7d2ade](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b7d2adeffaf626da978d7515984e338b5338cd35))
* Add UserEventType and handle user deletion ([e7c7148](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e7c71486feadf797320bae92acea20814defc9e9))
* auth on the websocket ([0a836f8](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/0a836f8c90eb1dfb7ebabae33bd572696da92397))
* change the system of ws command ([4d734de](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4d734dee20df8ed6848118f10117745ffa51f913))
* correlation id support into the interceptor ([ab66da1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ab66da1d6257f2309e51cbec00d683ee7853f734))
* Enhance story update handling with workflow notifications ([54ef4ec](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/54ef4ecf63d6d27ba27b4a60a4aff3a65c001058))
* feat websocket support ([542dad2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/542dad24b0fae891b90754fb33f6dd2f3d058aef))
* Implement workspace deletion handling ([a40116d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a40116d055d0aab4bca902e66c2d78419e927895))
* logout Action support for websocket ([55fb1a0](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/55fb1a02a71126d9c39aa3810ebd89a68964dedd))
* manual improvments dark theme ([aa3d157](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/aa3d1577945eace193b572779c195b12941bbdcc))
* style notification dialog ([5328cea](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5328cea2b7b76febda4ec256f5641fd0941c6942))
* subscribe project event ([df94432](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/df944325c28be22027349455dcf9cf91a4238dbd))
* subscribe workspace event ([cff3309](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cff33094fad34c216a8b73b2aaa99365043201fc))


### Bug Fixes

* all sass warnings ([139ae5d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/139ae5df2c3eaac96cf4be4777bc70a6ad4cf600))
* Enhance project settings deletion handling ([2fecadd](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/2fecaddf4f8da263348e64da43ea1d88872bbd81))
* ensure that e2e can run in parallel ([28c0a82](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/28c0a82299829cc509dc3995dcfa9d446cf79094))
* fix all automatically detectable accessibility issues ([9e5ed3f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/9e5ed3f84a54517c7396cda2388b6f8c5492de19))
* fix all automatically detectable accessibility issues ([8d7294f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8d7294f49ef3f5c8be57ccfd7f181a798a6898fa))
* **password:** password accepts all characters ([75a3c04](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/75a3c04c60a390b93c7c152fd70267f4cd26e224))
* some mixing async ([daac3d3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/daac3d35c14046718e044c3177cafb9bf9660730))

## [0.0.1-staging.5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.4...v0.0.1-staging.5) (2024-11-07)


### Bug Fixes

* split on undefined ([d174ebd](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d174ebd934df86326ec236694ef63631dfccc78c))

## [0.0.1-staging.4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.3...v0.0.1-staging.4) (2024-11-06)


### Bug Fixes

* hidden create acccount link ([a2fc152](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a2fc1520703c967366d6ea42999a56b1b99c3466))
* usability quickwins ([e98549a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e98549a6a3d5a98184edee65281065b11103eeef))

## [0.0.1-staging.3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.2...v0.0.1-staging.3) (2024-10-31)


### Bug Fixes

* add tenzu as favicon ([9963716](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/99637167f677f5ca5624108ab1df801fcd976d3e))

## [0.0.1-staging.2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.1...v0.0.1-staging.2) (2024-10-31)


### Features

* display a warning about data erase ([47dade8](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/47dade84ab7429a566e12aff2bac6648c3417d2d))


### Bug Fixes

* functional issues [#331](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/issues/331) [#387](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/issues/387) [#388](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/issues/388) ([35256ff](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/35256ff3c1cd734e4f9f66c8db4715d73cdbe9f3))
* issue 392 empty notification on email resend ([d2ebf1a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d2ebf1a7f29bc31ba0dd13d9448878fb521277d4))

## [0.0.1-staging.1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.0.1-staging.0...v0.0.1-staging.1) (2024-10-31)

## 0.0.1-staging.0 (2024-10-29)
