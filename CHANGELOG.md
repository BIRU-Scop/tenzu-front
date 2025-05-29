# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.0-staging.19](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.18...v0.1.0-staging.19) (2025-05-29)


### Bug Fixes

* **invitation:** prevent crash on invitation action permission check ([d8a10b1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d8a10b1c1bd3a83570c2a3b5fc5ff6b59c017186))

## [0.1.0-staging.18](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.17...v0.1.0-staging.18) (2025-05-28)


### Features

* add a fake project card in the workspace list component for user which has been invited to a workspace and not accept it yet ([13c6a5f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/13c6a5fede01d48f5233d6c49e45997acc1369dd))
* add a fake project card, blurred and locked, for when it has the disabled input as true ([e5422c2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e5422c278349335b833189797c52785e2632a95c))
* add directive to check userRole and a permission, and a redirect permission, add permission to project roles ([677ff34](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/677ff34d197fdda1fa5aa137bf897ef75c4cd6b4))
* add the accept workspace invitation function ([7c54170](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7c54170745244236782860f308df5070443c2f7f))
* add the deny workspace invitation function, extract the logic from the component to the service ([8736560](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/873656054b4b83ac5588245a9d7adac9219cf4ae))
* centralize story assignment logic ([79b65e3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/79b65e3453eb55cb6a21652b96e8ca3228066513))
* check permission to chose whether to display invitation tab or not ([b72a992](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b72a99266fab2510a1d59348e696d6c4421785fa))
* complete mail validation in invitation using synchronised sub forms ([76f3d36](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/76f3d36e31307a601b4cfee44a56b9e362ab8f83))
* email conflicting validation ([349fead](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/349fead1f0ee38f575969150d29d46be861f36b6))
* enhance role display with dynamic mapping ([716495e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/716495e4c69dfbf9171bfd29d9247dfc9466f200))
* extract story status logic to standalone component ([059326e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/059326e7828b3beac7e02f7e911803b2575cb8ef))
* invitation status display ([3750c1c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/3750c1c2eeed617beb6e78093be05775d52f621a))
* invitation status stylised component ([62e33d2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/62e33d22924a45d13f015e21af74309df5f1d79c))
* **invitation:** add resend invitation button ([0096270](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/0096270169afd1ec43c9df82d9ecd89e842989e7))
* **invitation:** add role field to create invitation dialog ([76bc43e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/76bc43e3aa904303bac64b39e5902b135cc593c3))
* **invitation:** add validation to each invitation field and make it writable instead of validating on single mailing list field ([cb2d10e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cb2d10edde5cd7e5a05d59f69f6226fe200035e5))
* **invitation:** change button display when resent has been emitted ([fe78f67](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/fe78f67cd0bcb8a1dc9d74b2b4bd9dbfaafcb1a6))
* **invitation:** disabled changing role for non-pending invitation ([7b51f89](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7b51f897c7dcb0a6314647c28e598c47ad226770))
* **invitation:** error on invitation field if using a member's email ([9bb938b](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/9bb938b57c0152bc21cdcf3004db82602d84f189))
* **invitation:** hide revoke button if user doesn't have owner permission on owner object ([8200749](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8200749f5d4ba8784fd41b489998eb38d92e76da))
* **invitation:** separate invitation action to their own component and add confirmation dialog ([5e08db2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5e08db2ed87acf667f9afc277b90c5a796d979a1))
* **invitation:** update role when changing role selector value ([5415926](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5415926be605501efa3b11cca55e3f4bae1d5958))
* **invitation:** use axisting invitation role as default if it exists ([a980f23](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a980f23518f6ed759d97e633a7e0aa2c054d8010))
* **invitation:** use role selector in invitation list ([805a950](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/805a950e3ed31d023425d228f42f001777c8c6ec))
* localize displayed date ([a96f22a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a96f22a023b032cfd363811c77ad4ea3fba72d76))
* **project-roles:** simplify parameter handling in API types ([9de3ef3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/9de3ef3a35889e42e3278fd2a67976e6826b104e))
* **project:** require workspaceId for project creation ([9138348](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/9138348fb9ba7d188182dc58053266fc9fa9cd58))
* replace roleSlug with roleId in invitations and add totalMembers field ([497df02](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/497df02cabf46ed171fcbf644732408cf0a6fa01))
* replace the new project button by buttons to accept workspace invitation when user is invited ([a8060d2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a8060d28d13460edba2b9d832c60d4d2027dbf26))
* **repository:** add workspace roles module ([badaa09](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/badaa09a4d1242d9b35adab1db656fe66eba9d7a))
* **role:** display tooltip in role selection ([1d2de7c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/1d2de7c7de45764872d01dbf111a347069e07601))
* **role:** prevent modification of owner role if user does not have enough permission ([c67ff13](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c67ff13ef6e014d03b4c3f826fc973669d46d6bb))
* **role:** remove owner role from selection if user does not have permission ([e1a1f57](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e1a1f57439b606dc591f7f1d0c07e96cd1adf518))
* **routes:** add role repository services to resolvers ([b3884a1](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b3884a10ebf51d6e58e58d4dc37ebabf43d9c259))
* simplify workflow service and API methods ([f60098c](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/f60098caa051eb993d1ae506f88a05ca81649da7))
* update API endpoint paths for token-based invitations ([551239d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/551239dcab8bffd1afcd0bfab4c950065225b869))
* use router to edit workspace ([bf7fb8f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/bf7fb8ff84c0ece87d9255ee224bef17f606baee))
* use table for invitation to display status ([141575b](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/141575b2cbf5c74c2732da457aed260bca90ac4f))


### Bug Fixes

* **invitation:** one-line displayed error message and fix width of invitation fields ([93f8949](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/93f89493e1d97539348f9e668579f2049e6411ea))
* **invitation:** prevent invitation action from using wrong service ([bc2583d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/bc2583dc1c0ae26c611dad4aff31b67a48fc92e7))
* **invitation:** put invitation in correct order after creating some ([4f892f2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4f892f22e2d9fa31a091d3dd01dd31cdc9d4cd5c))
* **invitation:** role not broken display in list and create and story status resize without losing the arrow ([28ee3b9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/28ee3b9a9dbdbdc2a5d29af881193ff483798913))
* prevent crash when closing invitation window by clicking outside it ([d4cb459](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d4cb459de0bdf679c5ed60fd7efc56d2486b76e7))
* **role:** make  role select field reactive ([dc30834](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/dc30834230e1be6c5159ddb70bb252eaed3e3880))
* **story-assignment:** update methods to use user ID instead of username ([776f090](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/776f0907e66212e409091b00bbad4f09f403e1a2))
* use correct name for move target workflow on deletion ([26d47ab](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/26d47ab492d396f06a7142192e3b1bdfb2310e36))

## [0.1.0-staging.17](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.16...v0.1.0-staging.17) (2025-05-02)


### Features

* add autologout on refresh token expiry and blacklist current token on user logout action ([9318300](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/931830072c5797cad8e252fe65b47ac285d2c9b4))
* add warning about logout on change password security page ([db6364d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/db6364db640327ff93bc40e2040fd0e0ab6f7164))


### Bug Fixes

* use linkedsignal for search field and use autocleanup subscribe instead of leaking one ([bf6be16](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/bf6be16eaed5b0a53eb3e3ebc31e20e9de1d1cb2))

## [0.1.0-staging.16](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.15...v0.1.0-staging.16) (2025-04-28)


### Bug Fixes

* improve story management and kanban workflow handling and fix assignees bug ([4b49dae](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4b49daef4072bb3c040b7b964b54a56d0e49a8f7))

## [0.1.0-staging.15](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.14...v0.1.0-staging.15) (2025-04-28)


### Features

* add a closable option for the user to log out if they want ([8d08bf9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8d08bf9c00011cefa54bec699a595e9b06d8d5b6))
* add a new guard to redirect user into homepage when is logged ([424e8ba](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/424e8bacd3dfadb1a2b76bd32c4817933cb32799))
* add denied in invitation status ([1299322](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/129932292357c64a18dc7203d8342b3129fa3f7f))
* handle new format for user deletion info ([112b03b](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/112b03baf47736c42c530b9edb867111e5990af1))
* **project:** add accept special cards ([1b9a1ce](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/1b9a1ceea5fd9b27febfc9d10b271b0878be43ba))
* **project:** add deny special cards ([67987fb](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/67987fbd8aa21231714c373fbf62b5eed44e9883))
* remove my from api endpoints ([8bd6d5f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8bd6d5f3d503c1c4b412987565a96e6a90f53fff))
* remove notion of workspace guests ([f67563d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/f67563d95a7a3bd8dd6ded8849e984159af10e1c))
* update models for workspace, user, project, invitation, membership and role in order to mirror backend serializers and validators, use statusId instead of status where relevant ([522dbc7](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/522dbc735d5a5870691cda418e10d44daf253a15))
* use new form of data from the api to display workspaces ([79b72ca](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/79b72cab04bf462dc401049b2dc46169c2b92f47))


### Bug Fixes

* add a badge to show unread notifications clearer, adjust margin to the notification unit for better presentation, darken the notif numbered badge ([56afea0](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/56afea076c314bfa3269ff57e8216a8128270f0c))
* add a check to avoid redirecting the user which is on a kanban on the selected story of another user ([8127637](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/81276376716d64302e32f4f299bb21911cb06f91))
* add code to display kanban name when full-screen story display ([ee3c686](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/ee3c68610fb237540c593795f1c1f7c8330ee807))
* add divider to notification menu header, reduce its size and the one of the toggle menu, label color lighter ([c4ae86d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c4ae86d4b7fcd8d4c91237c3b5e576fded35996b))
* add error 400 catcher by using the Django error object detail as a translation key ([4a7c93a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4a7c93a725429bf6deb0d14c15d8196edd4ba3a1))
* add more margin to the label of the toggle ([4c632f3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4c632f37b58fba5575af12e77e6a9aa064688085))
* add project update event listener and display translated notification ([45aadd8](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/45aadd8fd8cf5f68d5a7e806433f2800afb129d9))
* add project update event type and rename delete one for more harmony ([6d2ff45](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/6d2ff4545ec1b8af785063eba4c9ea4971635804))
* adjust styling of the adding button to delete the default ripple and focus styling, center the button with the same padding than the list item ([8bdcfea](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8bdcfea55e02a175c6356ef039c631598851978f))
* change word inside the dialog modale ([1bf3ed3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/1bf3ed3a2e2b470ac7655be597b33638fe7a4040))
* clean body ([7ece81d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7ece81d56514fca131680324cbe237868e913ac7))
* clean code ([e8bb621](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e8bb62195c623625e77a5ee07bc9ca17806b30d2))
* cover all the cases ([1cba8aa](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/1cba8aa0619abc1d289c1e5491053f773df19d2c))
* create signal to check if workflows maximum is reached, add tooltip and disabled to the button, change <a> classes into mat-icon-button ([b8a1acc](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b8a1acca734c47bc9692fd2e4fa5c0c761798796))
* fix default icon behavior to fix the oversized add member icon ([e29af85](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e29af859552ae64bdaf34a3106625da79461ccbc))
* fix mistake ([41cfd45](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/41cfd456ad30bd269fdef84315cad2312e4bd938))
* fix mistakes ([36cfa6e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/36cfa6e6403f88f24c14ad73b422adff9812a92f))
* force the login user to be redirect to the home page if they try to access the login/reset-password/sign-up pages ([c41ef9f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c41ef9f9f384abec76b98a2ebe06bdd617fcbf06))
* install ngx-file-saver to download correctly the file instead of browser link ([89d930e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/89d930ec51167666fe42e9dd6c841f842f79f35a))
* lighten the secondary info in the notification description and center the avatar with the text ([a1c5db5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a1c5db5b85979dfa609a6b13dab999608b3c7550))
* make stories movable in real time for user watching the same kanban ([92eb7d5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/92eb7d5bc9d221df3c36c7f4886be7137072a9d5))
* make the tokens overrides as dynamic as possible ([4bd70d3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/4bd70d34f5944b16129958d6cd2a362220124d6e))
* missing commented lines and a little refactor of the breadcrumbs store ([cba4e01](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cba4e01c5af86267c51a6da68147d6f07244567a))
* redirect to project invitation without depending on non-existent workspace invitation on user verification ([e85bf4e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e85bf4ee12b36b35412f1ed54d0eef016fc920cf))
* replace the breadcrumb logic into a higher component than story-detail to adapt it to the story layout ([874532d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/874532d3a060f75fae24254b489b3315bd58f17b))
* reset file typed input to force Chrome not refusing the deleted file to be upload again ([e96851a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e96851a9a7ee079bedc57b4d4b0c058bc6c506f3))
* side-nav layout deleted story fixed ([488e1f6](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/488e1f649609a949c1692cd9d0bd4cecd5035cf1))
* simplify code to avoid repetition ([5c7f25b](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5c7f25b04d329d2053979a08f03e3a26a8175837))
* simplify the code ([824543b](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/824543b2893d6e0b9aeaddd833480daa559bf722))
* simplify the function which take the first two letters from a project name ([7430ac6](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/7430ac683cba2f41cb0d6b26e68f8b513f3b5225))
* uninstall ngx-file-saver to keep only file-saver and reduce dependencies ([a1fffd7](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/a1fffd7b88b1752eeda7e19a01f4db96ea709cce))
* update guests list after sending a invite to a project member ([576a4f5](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/576a4f5106462dd0e0db7d60ee076f3cd78c8c58))
* update guests list after sending a invite to a worskpace member ([8d1b9d3](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8d1b9d3c057e629159a22f1ee2edd56632ce501e))
* update workspaces or projects summary list without error after accepting or denying an invitation ([80b5a3e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/80b5a3e4ee68ced5964c74b4de0b9605376bcc85))
* use new path for data manipulation ([5177735](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/517773522ca414200c5eccb7e8c37f273e007981))
* wrong create url typing ([5bef599](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5bef59911358c7bc5f94890d66ae72073a82c062))

## [0.1.0-staging.14](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.13...v0.1.0-staging.14) (2025-02-27)

## [0.1.0-staging.13](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.12...v0.1.0-staging.13) (2025-02-04)


### Features

* emit closed event when deleting a story ([fa09c89](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/fa09c894951345a3ccca70818e3b3ed47bdbb9a3))
* enhance workflow update handling in story detail view ([485e84f](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/485e84f945fcc9f85d22c79bd411f1dfc5476c5c))
* give soul to 404 page ([e3d35dd](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e3d35dd5bcecb1d9b7a2d36477ae769b9b633e25))
* **kanban:** enhance workflow navigation logic ([687cf65](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/687cf655568079f6eaf39f82ee987290ba46bfcb))
* **story:** add updateWorkflowStoryDetail method ([02b0e08](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/02b0e0888c94136b036cc879b4eff1014a3d0970))
* **urls:** add functions to generate story detail URLs ([0f6097d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/0f6097d7eabd16ebc2e3ffa264c533e232f0d5f0))


### Bug Fixes

* change workflow for a story didn't work ([c151552](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/c1515521c05193f3a15b0b1821afbe9f455127db))
* correct workflow matching logic and add story workflow update ([5e7fb69](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5e7fb6937c9e588782e61654c68e0a102c538abe))
* github workflow ([591ff12](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/591ff12c43286ac685aa04db72fdc78bb664f634))
* **i18n:** update "workflow" translations to "kanban" ([084b47d](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/084b47dd1862a2574ddd507437811abbf8d6338f))
* **kanban:** update URL handling for workflow changes ([3d72562](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/3d725627481bb6069fb64f5e7cdb0007c0f8892a))
* prevent persistent password must match error ([cb2bd06](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cb2bd06f6beb98b0d5c3555ca016f42592dd20b8))
* **routes:** replace try-catch with promise catch ([cbb8dca](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cbb8dcaa77eb534d4e409915d810c074e9593db4))

## [0.1.0-staging.12](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.11...v0.1.0-staging.12) (2025-01-27)


### Features

* add close functionality to story detail components ([17d0786](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/17d078684e16bc205e3d1261399cae2add7e0482))
* **urls:** project cards now redirects to landing page ([b7d6948](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b7d6948c5e5db778669f3b9ae72db154ab4604f2))
* **workflow:** edit and delete workflows real time p1 ([efbd9f2](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/efbd9f273b10829d38541ee11a3458d44588acca))
* **workflow:** edit name and delete workflows ([d0810da](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/d0810dabdd8136911dc46087b4ce85ffac83b993))


### Bug Fixes

* **dialog:** enable proper closing of story detail dialog ([b2936ea](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/b2936ea02d0b35f2c79d892ce028b0c3101bd897))
* **interceptor:** login properly displays error ([47ac33e](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/47ac33eb3a0be774d7d1d8457a8e31b27e6f209e))
* prevent errors on invalid workflow slug selection ([36f15dc](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/36f15dcd22402b8523d0cd8d927dcfd8cbd666b9))
* **project.store:** correct workflow addition logic ([cfcd5e4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cfcd5e4b441095c0dbfe10300a850909d1665310))
* **sidenav:** adjust content height to account for spacing ([8a4a60a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/8a4a60a3044b5f55af5abe5ccf613852f995a03a))
* **story:** prevent mutation of orderStoryByStatus in drag-drop ([427197a](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/427197a69ad1dd928a9005c61d82f3f0266f5c50))
* **workspace:** cancel invitation dialog no longer raises error ([e091fd4](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/e091fd44f7bf1af28c6d44f13df100cc4a197b88))

## [0.1.0-staging.11](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/compare/v0.1.0-staging.10...v0.1.0-staging.11) (2025-01-16)


### Bug Fixes

* langages not loading at init ([cf966ab](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/cf966abc5c074e171f6744637edd32c3adac187e))
* missing translation ([5c8acc9](https://gitlab.biru.sh/biru/dev/tenzu/tenzu-front/commit/5c8acc987a5d2e7e11c31e19ff2502883b623cf9))

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
