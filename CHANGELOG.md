## [1.31.2](https://github.com/ChaoLing140/StellarInsure/compare/v1.31.1...v1.31.2) (2026-06-01)


### Bug Fixes

* prevent path traversal, prevent double initialization, enforce consistent auth errors and add yield rounding tests ([3ff7ece](https://github.com/ChaoLing140/StellarInsure/commit/3ff7ecef88dfad23dcbcb6d0e58ff1f743f8986e))

# 1.0.0 (2026-06-01)


### Bug Fixes

* [#208](https://github.com/TeeYml/StellarInsure/issues/208) [#211](https://github.com/TeeYml/StellarInsure/issues/211) [#212](https://github.com/TeeYml/StellarInsure/issues/212) [#215](https://github.com/TeeYml/StellarInsure/issues/215) resolve frontend & docker issues ([29a6d2a](https://github.com/TeeYml/StellarInsure/commit/29a6d2ac37f8c2e32169914185bdd0684615cb59))
* add config guards and transaction filter validation ([809d1aa](https://github.com/TeeYml/StellarInsure/commit/809d1aa4c5f5ca917b4bdd8a184d8b81da4296a9))
* backend validation and pagination improvements ([f5541a4](https://github.com/TeeYml/StellarInsure/commit/f5541a464fa0240f573d9ed4b96b6e421b91387d)), closes [#358](https://github.com/TeeYml/StellarInsure/issues/358) [#355](https://github.com/TeeYml/StellarInsure/issues/355) [#361](https://github.com/TeeYml/StellarInsure/issues/361) [#362](https://github.com/TeeYml/StellarInsure/issues/362) [#358](https://github.com/TeeYml/StellarInsure/issues/358) [#355](https://github.com/TeeYml/StellarInsure/issues/355) [#361](https://github.com/TeeYml/StellarInsure/issues/361) [#362](https://github.com/TeeYml/StellarInsure/issues/362)
* **ci:** add backend deployment pipeline with migrations and rollback ([2a250ba](https://github.com/TeeYml/StellarInsure/commit/2a250ba523df1335da8784c74fb6b3bbc165c3ce))
* **ci:** add Trivy security scanning workflow ([0c7272e](https://github.com/TeeYml/StellarInsure/commit/0c7272eec002e635e14f1fcc98e88f8ed306efd7)), closes [ChaoLing140/StellarInsure#218](https://github.com/ChaoLing140/StellarInsure/issues/218)
* **frontend:** improve skip-link focus handling ([#144](https://github.com/TeeYml/StellarInsure/issues/144)) ([47ac771](https://github.com/TeeYml/StellarInsure/commit/47ac771b0a2064cdae55dedffc12f9287a28e4c5))
* improve header and notifications accessibility ([823e57f](https://github.com/TeeYml/StellarInsure/commit/823e57f569e5bb58bfe8aa9062d6a5c695c6b968))
* preserve trigger condition builder value from saved draft ([ac4fe2a](https://github.com/TeeYml/StellarInsure/commit/ac4fe2a3f5e569fe40d9564a08f7b84821328013))
* prevent path traversal, prevent double initialization, enforce consistent auth errors and add yield rounding tests ([3ff7ece](https://github.com/TeeYml/StellarInsure/commit/3ff7ecef88dfad23dcbcb6d0e58ff1f743f8986e))
* render pending policy cards without hash href ([40a19ed](https://github.com/TeeYml/StellarInsure/commit/40a19ed985770a55f473befda244475381770b11))
* replace console.log with proper logging mechanism ([761346c](https://github.com/TeeYml/StellarInsure/commit/761346c23109b0f76562167ef59354582937ade8)), closes [#282](https://github.com/TeeYml/StellarInsure/issues/282)
* replace raw HTTPException with custom errors in storage service ([39794f8](https://github.com/TeeYml/StellarInsure/commit/39794f8abfc53fa47c0ad4a23fac518a08f4a45f))
* resolve issues [#307](https://github.com/TeeYml/StellarInsure/issues/307), [#309](https://github.com/TeeYml/StellarInsure/issues/309), [#311](https://github.com/TeeYml/StellarInsure/issues/311), [#314](https://github.com/TeeYml/StellarInsure/issues/314) ([18b1edc](https://github.com/TeeYml/StellarInsure/commit/18b1edc55415eef12d53571212569607fd8d2440))
* resolve issues [#317](https://github.com/TeeYml/StellarInsure/issues/317), [#324](https://github.com/TeeYml/StellarInsure/issues/324), [#325](https://github.com/TeeYml/StellarInsure/issues/325), [#326](https://github.com/TeeYml/StellarInsure/issues/326) ([a2b6e02](https://github.com/TeeYml/StellarInsure/commit/a2b6e02b95c6ca7214331cded4e06578a3fbbad6))
* resolve issues [#330](https://github.com/TeeYml/StellarInsure/issues/330), [#335](https://github.com/TeeYml/StellarInsure/issues/335), [#337](https://github.com/TeeYml/StellarInsure/issues/337), [#344](https://github.com/TeeYml/StellarInsure/issues/344) (frontend improvements) ([959ab5f](https://github.com/TeeYml/StellarInsure/commit/959ab5f418f48a47b491748b5624ba87d03b1149))
* resolve issues [#387](https://github.com/TeeYml/StellarInsure/issues/387), [#395](https://github.com/TeeYml/StellarInsure/issues/395), [#400](https://github.com/TeeYml/StellarInsure/issues/400), [#401](https://github.com/TeeYml/StellarInsure/issues/401) ([83b0c13](https://github.com/TeeYml/StellarInsure/commit/83b0c13a0d664cd105d91445752972a61fcf7172))
* resolve issues [#433](https://github.com/TeeYml/StellarInsure/issues/433) [#430](https://github.com/TeeYml/StellarInsure/issues/430) [#438](https://github.com/TeeYml/StellarInsure/issues/438) [#446](https://github.com/TeeYml/StellarInsure/issues/446) ([0f36834](https://github.com/TeeYml/StellarInsure/commit/0f3683486b595c072fe8f399a9104d317c8bab14))
* resolve lint errors and add missing icon definitions ([ea7df54](https://github.com/TeeYml/StellarInsure/commit/ea7df54fb2ac82cdd9f159cd84288f5c7600dd65))
* restrict CORS to specific origins for security ([440eb67](https://github.com/TeeYml/StellarInsure/commit/440eb673db36fcaf499f1092990a94565d6f90da))
* standardize error handling, add icon aria-hidden, document contract state vars ([1dd3967](https://github.com/TeeYml/StellarInsure/commit/1dd39678b9396758b665ba4952754b09d8910ac1)), closes [#277](https://github.com/TeeYml/StellarInsure/issues/277) [#276](https://github.com/TeeYml/StellarInsure/issues/276) [#279](https://github.com/TeeYml/StellarInsure/issues/279) [#276](https://github.com/TeeYml/StellarInsure/issues/276) [#277](https://github.com/TeeYml/StellarInsure/issues/277) [#279](https://github.com/TeeYml/StellarInsure/issues/279)
* **table:** improve table semantics and accessibility ([30be705](https://github.com/TeeYml/StellarInsure/commit/30be705a5e80ebb5d3c4d47f05ec5db28bb2c675)), closes [#143](https://github.com/TeeYml/StellarInsure/issues/143)


### Features

* **#124:** Add retry UI for failed transactions ([2b87699](https://github.com/TeeYml/StellarInsure/commit/2b87699890ffc0be702a71873ef1c0cc79fdc88d)), closes [#124](https://github.com/TeeYml/StellarInsure/issues/124)
* add claim flow polish, CODEOWNERS, release workflow, and component tests ([96180ec](https://github.com/TeeYml/StellarInsure/commit/96180ecdd825950c9089a3ec2b94f080a4769fee)), closes [#205](https://github.com/TeeYml/StellarInsure/issues/205) [#216](https://github.com/TeeYml/StellarInsure/issues/216) [#217](https://github.com/TeeYml/StellarInsure/issues/217) [#222](https://github.com/TeeYml/StellarInsure/issues/222) [#205](https://github.com/TeeYml/StellarInsure/issues/205) [#216](https://github.com/TeeYml/StellarInsure/issues/216) [#217](https://github.com/TeeYml/StellarInsure/issues/217) [#222](https://github.com/TeeYml/StellarInsure/issues/222)
* add claim form error summary with field navigation ([#340](https://github.com/TeeYml/StellarInsure/issues/340)) ([727f69a](https://github.com/TeeYml/StellarInsure/commit/727f69a8681119901d78ff0f2d82709ea6e335f0))
* add comprehensive input validation with Pydantic ([bfc8e99](https://github.com/TeeYml/StellarInsure/commit/bfc8e995758742d251bca0ac639409d377eef358))
* add contract events risk pool and test coverage ([e78c957](https://github.com/TeeYml/StellarInsure/commit/e78c9573ee27a77059c978bf870212aa323ef455))
* add formatted coverage amount inputs for [#73](https://github.com/TeeYml/StellarInsure/issues/73) ([c356b70](https://github.com/TeeYml/StellarInsure/commit/c356b701cf14dd6fc741f4a650f5bbcddfaf952d))
* add frontend quality improvements and ci workflows ([c00876b](https://github.com/TeeYml/StellarInsure/commit/c00876b9a8a81d798751916d33d560c0c3170cef))
* add global rate limiting to gateway ([0995c90](https://github.com/TeeYml/StellarInsure/commit/0995c90cf2b353698d9e411a8dd01c2f4270c772))
* add i18n support to policies page filters ([1436aac](https://github.com/TeeYml/StellarInsure/commit/1436aacbcec39bd92f6c36e7f784ed9b865657e3))
* add i18n support to settings page ([985f176](https://github.com/TeeYml/StellarInsure/commit/985f176faeb28afcb380fefbe54ad8e1f1eef2a0))
* add k8s manifests and staging deployment workflow ([31ef8ef](https://github.com/TeeYml/StellarInsure/commit/31ef8eff8456644def03f68d3f542e035a9c57bd))
* add PostgreSQL connection pooling configuration ([4a7ccfa](https://github.com/TeeYml/StellarInsure/commit/4a7ccfaa88117e6deb592b425b4229ea1a744b6d))
* added network swticher ([ec3a2a8](https://github.com/TeeYml/StellarInsure/commit/ec3a2a802fc503d5d2827893d26c3b8fe835d19e))
* added partial claim support to contracts ([761ab03](https://github.com/TeeYml/StellarInsure/commit/761ab03cd8ef2f313eeec9dc1bfe5387f763ecb7))
* addede the fixes ([313064e](https://github.com/TeeYml/StellarInsure/commit/313064e9588ed8b8004baca80aca5c6f2efdc778))
* **analytics:** integrate date range picker with preset shortcuts into dashboard ([5d2aa04](https://github.com/TeeYml/StellarInsure/commit/5d2aa04bc4cd9e5c56045680976ec1047540b083))
* API error boundaries, offline banner, unsaved guard, reduced-motion ([#125](https://github.com/TeeYml/StellarInsure/issues/125) [#126](https://github.com/TeeYml/StellarInsure/issues/126) [#122](https://github.com/TeeYml/StellarInsure/issues/122) [#139](https://github.com/TeeYml/StellarInsure/issues/139)) ([d5d1ad2](https://github.com/TeeYml/StellarInsure/commit/d5d1ad29f6ca84efebb552fec8fd74153a0bf7bf))
* **backend:** add environment config, rate limiting, Redis caching, and webhook notifications ([6d6a2bc](https://github.com/TeeYml/StellarInsure/commit/6d6a2bca402d17b7a0618540d12ce6939e1872e0)), closes [#48](https://github.com/TeeYml/StellarInsure/issues/48) [#11](https://github.com/TeeYml/StellarInsure/issues/11) [#9](https://github.com/TeeYml/StellarInsure/issues/9) [#49](https://github.com/TeeYml/StellarInsure/issues/49)
* build policy summary review step for [#78](https://github.com/TeeYml/StellarInsure/issues/78) ([92564cf](https://github.com/TeeYml/StellarInsure/commit/92564cfbb56ae56fa360825375e80a7a3fc9d3f3))
* **build:** configure route-level code splitting ([9605f69](https://github.com/TeeYml/StellarInsure/commit/9605f69c8556cfccb6c8b0235ffa412deefbf114)), closes [#150](https://github.com/TeeYml/StellarInsure/issues/150)
* **claims:** add payout breakdown component with line items and status badge ([53b285b](https://github.com/TeeYml/StellarInsure/commit/53b285b6a656a3f5d7c4df53cdb1ace957226163))
* **claims:** implement claim submission form with evidence inputs and preview ([6743314](https://github.com/TeeYml/StellarInsure/commit/674331467d53d0ce54a96c4151e3bcd571dc4169))
* **components:** add accessible popover primitive ([c1928e6](https://github.com/TeeYml/StellarInsure/commit/c1928e6ac52f2873eb8e2aec48a8c4c66604b08e)), closes [#146](https://github.com/TeeYml/StellarInsure/issues/146)
* **contracts:** implement claim payout verification and treasury tracking ([#20](https://github.com/TeeYml/StellarInsure/issues/20)) ([dc4ad59](https://github.com/TeeYml/StellarInsure/commit/dc4ad5945d615b4820a94bf234fe80f9bbbaecda))
* **contracts:** implement policy expiration checking ([#18](https://github.com/TeeYml/StellarInsure/issues/18)) ([4e22353](https://github.com/TeeYml/StellarInsure/commit/4e22353f2013214c222ea230a6237b3635745332))
* **create:** add visible autosave status indicator ([0b4fb0b](https://github.com/TeeYml/StellarInsure/commit/0b4fb0be546be2d609ef5e5430739be9519645b1)), closes [#328](https://github.com/TeeYml/StellarInsure/issues/328)
* **create:** add visible autosave status on create policy ([4171f71](https://github.com/TeeYml/StellarInsure/commit/4171f71ea10501f990fc1218128e194783ca361b)), closes [#328](https://github.com/TeeYml/StellarInsure/issues/328)
* **create:** localize remaining hardcoded receipt copy ([d646fc7](https://github.com/TeeYml/StellarInsure/commit/d646fc7fcfdd0ee056fd89c35692a6103b1e3cbd)), closes [#331](https://github.com/TeeYml/StellarInsure/issues/331)
* fix issues [#285](https://github.com/TeeYml/StellarInsure/issues/285) and [#283](https://github.com/TeeYml/StellarInsure/issues/283) ([4ecde49](https://github.com/TeeYml/StellarInsure/commit/4ecde499a25d4a15ff787b94834bdb6a586cc6ed))
* **frontend:** add claim eligibility pre-check UI ([f94f20c](https://github.com/TeeYml/StellarInsure/commit/f94f20c2d5b3e1415ed1f5456dfd93766ad63b69)), closes [#93](https://github.com/TeeYml/StellarInsure/issues/93)
* **frontend:** add keyboard shortcuts help modal ([86386ef](https://github.com/TeeYml/StellarInsure/commit/86386efcdbf969a05cd75cd6c15e90acb4d58a20)), closes [ChaoLing140/StellarInsure#111](https://github.com/ChaoLing140/StellarInsure/issues/111)
* **frontend:** add pending transaction timeline ([680a735](https://github.com/TeeYml/StellarInsure/commit/680a73500a2465d214643eb9f731384082405e73)), closes [#81](https://github.com/TeeYml/StellarInsure/issues/81)
* **frontend:** add reusable modal, drawer, pagination, file validation, and policy selector components ([74dc5d8](https://github.com/TeeYml/StellarInsure/commit/74dc5d858738ceae4468b05456a4aab1d74b9930)), closes [#113](https://github.com/TeeYml/StellarInsure/issues/113) [#115](https://github.com/TeeYml/StellarInsure/issues/115) [#118](https://github.com/TeeYml/StellarInsure/issues/118) [#112](https://github.com/TeeYml/StellarInsure/issues/112)
* **frontend:** add reusable route seo metadata ([e3bdfc4](https://github.com/TeeYml/StellarInsure/commit/e3bdfc4a11b7543764a8a3d1107cc9d4e37b8361))
* **frontend:** build policy creation page shell with stepper layout ([c2b2ad0](https://github.com/TeeYml/StellarInsure/commit/c2b2ad0ba738969ebd4a561a15ceb2b1ff18596d)), closes [#71](https://github.com/TeeYml/StellarInsure/issues/71)
* **frontend:** create transaction confirmation modal ([cbe204b](https://github.com/TeeYml/StellarInsure/commit/cbe204bb2dd10f4460dae3fbf97f5b24c452fd32)), closes [#80](https://github.com/TeeYml/StellarInsure/issues/80)
* **frontend:** create trigger-builder, premium-estimate, and validation-summary components ([#76](https://github.com/TeeYml/StellarInsure/issues/76), [#74](https://github.com/TeeYml/StellarInsure/issues/74), [#84](https://github.com/TeeYml/StellarInsure/issues/84)) ([89980ed](https://github.com/TeeYml/StellarInsure/commit/89980edd4dcf51e2c92a8888af0c61b10b51b76f))
* **frontend:** expand settings page with account, preferences, and security sections ([2f23a39](https://github.com/TeeYml/StellarInsure/commit/2f23a39fd39c4b5de3a7bd2d9acb2474bf0894e4)), closes [#99](https://github.com/TeeYml/StellarInsure/issues/99)
* **frontend:** implement loading skeleton library ([4c6f387](https://github.com/TeeYml/StellarInsure/commit/4c6f3872d64f915118b08340b2ce6fb0da13eb2b)), closes [#85](https://github.com/TeeYml/StellarInsure/issues/85)
* **frontend:** implement notifications center panel component ([8443dd6](https://github.com/TeeYml/StellarInsure/commit/8443dd62f4738e7028f4c6eebff3b6eacbcb63ed)), closes [#97](https://github.com/TeeYml/StellarInsure/issues/97)
* **frontend:** implement policy draft autosave ([935ed13](https://github.com/TeeYml/StellarInsure/commit/935ed13f55e1238f51f4aae9a43caaa28c268e7b)), closes [#79](https://github.com/TeeYml/StellarInsure/issues/79)
* **frontend:** implement policy type selector cards ([ade8f80](https://github.com/TeeYml/StellarInsure/commit/ade8f80903f05afbccc79b3bd09ed44b2b49f0c1)), closes [#72](https://github.com/TeeYml/StellarInsure/issues/72)
* **frontend:** implement responsive mobile bottom navigation ([#131](https://github.com/TeeYml/StellarInsure/issues/131)) ([b7da18a](https://github.com/TeeYml/StellarInsure/commit/b7da18a0844d120c92ba268175b2188c80b283cf))
* **frontend:** improve policy detail usability ([06b9e74](https://github.com/TeeYml/StellarInsure/commit/06b9e74830ddc90b056bae456f1c09c757437cc3))
* **frontend:** integrate condition builder, premium estimate, and validation summary ([#76](https://github.com/TeeYml/StellarInsure/issues/76), [#74](https://github.com/TeeYml/StellarInsure/issues/74), [#84](https://github.com/TeeYml/StellarInsure/issues/84)) ([c1b14e3](https://github.com/TeeYml/StellarInsure/commit/c1b14e3857333365318a259bc7f9bab9d9dddcd1))
* implement [#189](https://github.com/TeeYml/StellarInsure/issues/189) transactions endpoint, [#187](https://github.com/TeeYml/StellarInsure/issues/187) stellar signature verification, [#196](https://github.com/TeeYml/StellarInsure/issues/196) multiple claims support, [#188](https://github.com/TeeYml/StellarInsure/issues/188) JWT blacklisting ([61fcdd5](https://github.com/TeeYml/StellarInsure/commit/61fcdd5a4cbf37a4dbb15d358c0a25f7b9abd41a))
* implement claim endpoints with file upload support ([f52f40d](https://github.com/TeeYml/StellarInsure/commit/f52f40d47cfe33a93f5d53cc04c7e56e78eda776))
* implement claim endpoints with file upload support ([8438a05](https://github.com/TeeYml/StellarInsure/commit/8438a05004f3453befd78be51d4d00dda6a7795e))
* implement dark mode with theme toggle and system preference support ([4b8f35f](https://github.com/TeeYml/StellarInsure/commit/4b8f35f72c6a777276f3c262e1e9d8db91b9e2c8))
* implement database models with SQLAlchemy ([06814fa](https://github.com/TeeYml/StellarInsure/commit/06814fa2efbb8d66955e81fb0cc06392787b22d4))
* implement frontend issues [#119](https://github.com/TeeYml/StellarInsure/issues/119), [#117](https://github.com/TeeYml/StellarInsure/issues/117), [#120](https://github.com/TeeYml/StellarInsure/issues/120), [#116](https://github.com/TeeYml/StellarInsure/issues/116) ([eaf53cb](https://github.com/TeeYml/StellarInsure/commit/eaf53cba795d8234dec61d473be9b23d9e8a7a96))
* implement frontend issues [#91](https://github.com/TeeYml/StellarInsure/issues/91), [#95](https://github.com/TeeYml/StellarInsure/issues/95), [#121](https://github.com/TeeYml/StellarInsure/issues/121), [#123](https://github.com/TeeYml/StellarInsure/issues/123) ([499a80a](https://github.com/TeeYml/StellarInsure/commit/499a80ae4f651d9d29567d762fe1443de24795c1))
* implement issue [#207](https://github.com/TeeYml/StellarInsure/issues/207) - API client integration ([2032b2c](https://github.com/TeeYml/StellarInsure/commit/2032b2c22fe0e6340360074869d91fab5b4f39a0))
* implement issues [#21](https://github.com/TeeYml/StellarInsure/issues/21), [#30](https://github.com/TeeYml/StellarInsure/issues/30), [#32](https://github.com/TeeYml/StellarInsure/issues/32), [#47](https://github.com/TeeYml/StellarInsure/issues/47) ([9bf8602](https://github.com/TeeYml/StellarInsure/commit/9bf860204d296fc259d2d4a0b4889626972df105))
* implement issues [#228](https://github.com/TeeYml/StellarInsure/issues/228), [#300](https://github.com/TeeYml/StellarInsure/issues/300), [#305](https://github.com/TeeYml/StellarInsure/issues/305), [#306](https://github.com/TeeYml/StellarInsure/issues/306) ([beccdfe](https://github.com/TeeYml/StellarInsure/commit/beccdfef7003d247f75a142581a247322107b069))
* implement issues [#367](https://github.com/TeeYml/StellarInsure/issues/367), [#373](https://github.com/TeeYml/StellarInsure/issues/373), [#375](https://github.com/TeeYml/StellarInsure/issues/375), [#381](https://github.com/TeeYml/StellarInsure/issues/381) ([3cd2072](https://github.com/TeeYml/StellarInsure/commit/3cd20723d95740b26d83c749d7c7d3d51ba3262e))
* implement JWT authentication system ([2df9dd2](https://github.com/TeeYml/StellarInsure/commit/2df9dd271dbcb526b832fcf733d5f9d7c1c7e47d))
* implement policy endpoints with pagination and filtering ([e868b1c](https://github.com/TeeYml/StellarInsure/commit/e868b1c6e7a306f398d0c962908c0c956aa57c0c))
* implement status pills, sortable policy table, onboarding checklist, and withdrawal flow ([4629294](https://github.com/TeeYml/StellarInsure/commit/4629294d89f632b421bc50ae2d3a78f09f39473c))
* implement Stellar smart contract integration ([bd66b5a](https://github.com/TeeYml/StellarInsure/commit/bd66b5a1d56e63a56cd83a9d78c9c4c02b6f0d0e))
* implement token transfers and backend testing factories ([a30df2d](https://github.com/TeeYml/StellarInsure/commit/a30df2d8c529f47b5ae2950c5bc0a61af3ee6acb))
* implement transaction history, onboarding flow, backend logging, and contract upgradeability ([8800f2f](https://github.com/TeeYml/StellarInsure/commit/8800f2f0e78ba072ff793b30b7bafaf485c79ff1))
* initial commit - StellarInsure parametric insurance protocol ([9a883eb](https://github.com/TeeYml/StellarInsure/commit/9a883ebda635bb61c3cd41d78c26eeecf0e3e5e3))
* **metrics:** add chart data table fallback for policy metrics ([7ee308f](https://github.com/TeeYml/StellarInsure/commit/7ee308fd4e78bfa9a87840bf0dd183ec20ab1aae)), closes [#346](https://github.com/TeeYml/StellarInsure/issues/346)
* multi-sig admin ([#16](https://github.com/TeeYml/StellarInsure/issues/16)), policy renewal ([#22](https://github.com/TeeYml/StellarInsure/issues/22)), integration tests ([#29](https://github.com/TeeYml/StellarInsure/issues/29)), emergency pause ([#51](https://github.com/TeeYml/StellarInsure/issues/51)) ([48c88f0](https://github.com/TeeYml/StellarInsure/commit/48c88f0b8821297da48ef0da16c9aea5eb669e90))
* **policies:** fix aria labels, remove any types, persist view mode, add result count ([7381748](https://github.com/TeeYml/StellarInsure/commit/73817485d2eb582b9e0e139fe711f4b992c1bdce)), closes [#312](https://github.com/TeeYml/StellarInsure/issues/312) [#313](https://github.com/TeeYml/StellarInsure/issues/313) [#310](https://github.com/TeeYml/StellarInsure/issues/310) [#316](https://github.com/TeeYml/StellarInsure/issues/316) [#310](https://github.com/TeeYml/StellarInsure/issues/310) [#312](https://github.com/TeeYml/StellarInsure/issues/312) [#313](https://github.com/TeeYml/StellarInsure/issues/313) [#316](https://github.com/TeeYml/StellarInsure/issues/316)
* policy list filter ([654ec50](https://github.com/TeeYml/StellarInsure/commit/654ec50663dff595c541d8503924bd53b52ed54a))
* **pools:** add risk pool deposit flow with multi-step UI and utilization display ([6ee8b55](https://github.com/TeeYml/StellarInsure/commit/6ee8b55b49e7e65648699b977d72ae8071d94b30))
* premium calculation, mutation testing, and legal pages ([c7f4d1f](https://github.com/TeeYml/StellarInsure/commit/c7f4d1f4637e1ddbdad9676906902f89f59a158e)), closes [#17](https://github.com/TeeYml/StellarInsure/issues/17) [#52](https://github.com/TeeYml/StellarInsure/issues/52) [#128](https://github.com/TeeYml/StellarInsure/issues/128)
* reject stale oracle prices, improve mobile policy tables, enforce reads expiration and gate lockfile drift ([247b6d8](https://github.com/TeeYml/StellarInsure/commit/247b6d816c7b1c7c59f0ea53146f8f4c83a57188))
* resolve issue templates, layout navigation, and fuzz coverage ([704bfbe](https://github.com/TeeYml/StellarInsure/commit/704bfbe3870619f081b0681b7336e4a09d3d6615))
* resolve multiple backend and contract issues ([80d6697](https://github.com/TeeYml/StellarInsure/commit/80d66978af56fce714dc1226aad6f689e6cdc7a2)), closes [#190](https://github.com/TeeYml/StellarInsure/issues/190) [#186](https://github.com/TeeYml/StellarInsure/issues/186) [#192](https://github.com/TeeYml/StellarInsure/issues/192) [#195](https://github.com/TeeYml/StellarInsure/issues/195) [#190](https://github.com/TeeYml/StellarInsure/issues/190) [#186](https://github.com/TeeYml/StellarInsure/issues/186) [#192](https://github.com/TeeYml/StellarInsure/issues/192) [#195](https://github.com/TeeYml/StellarInsure/issues/195)
* scaffold accessible tooltip component with hover/focus/blur handlers ([52bc8d4](https://github.com/TeeYml/StellarInsure/commit/52bc8d42f6b595c636b7adc4c272d58aa47c2f05))
* **settings:** add arrow key navigation to settings tabs ([8181794](https://github.com/TeeYml/StellarInsure/commit/818179476f1f0069a68b6c398a491f924083f42b)), closes [#336](https://github.com/TeeYml/StellarInsure/issues/336)
* tighten radius tokens, fix dark accent contrast, add hero preview, flush features section ([01fd4fb](https://github.com/TeeYml/StellarInsure/commit/01fd4fb0e9a49092b328d51a812e13065a847cd0)), closes [#319](https://github.com/TeeYml/StellarInsure/issues/319) [#320](https://github.com/TeeYml/StellarInsure/issues/320) [#321](https://github.com/TeeYml/StellarInsure/issues/321) [#323](https://github.com/TeeYml/StellarInsure/issues/323)
* unread badge, coverage range guard, /create CTA, responsive skeleton ([30adf9b](https://github.com/TeeYml/StellarInsure/commit/30adf9b454aea461eac8bc57882a16e3587952ed)), closes [#302](https://github.com/TeeYml/StellarInsure/issues/302) [#318](https://github.com/TeeYml/StellarInsure/issues/318) [#308](https://github.com/TeeYml/StellarInsure/issues/308) [#339](https://github.com/TeeYml/StellarInsure/issues/339)
* Update Next.js, fix CSS variables, add oracle integration ([0736d07](https://github.com/TeeYml/StellarInsure/commit/0736d07694c5e06bd16ac4518366ded486f76e15)), closes [#275](https://github.com/TeeYml/StellarInsure/issues/275) [#280](https://github.com/TeeYml/StellarInsure/issues/280) [#198](https://github.com/TeeYml/StellarInsure/issues/198)

## [1.31.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.31.0...v1.31.1) (2026-06-01)


### Bug Fixes

* resolve issues [#433](https://github.com/ChaoLing140/StellarInsure/issues/433) [#430](https://github.com/ChaoLing140/StellarInsure/issues/430) [#438](https://github.com/ChaoLing140/StellarInsure/issues/438) [#446](https://github.com/ChaoLing140/StellarInsure/issues/446) ([0f36834](https://github.com/ChaoLing140/StellarInsure/commit/0f3683486b595c072fe8f399a9104d317c8bab14))

# [1.31.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.30.0...v1.31.0) (2026-06-01)


### Features

* reject stale oracle prices, improve mobile policy tables, enforce reads expiration and gate lockfile drift ([247b6d8](https://github.com/ChaoLing140/StellarInsure/commit/247b6d816c7b1c7c59f0ea53146f8f4c83a57188))

# 1.0.0 (2026-05-31)


### Bug Fixes

* [#208](https://github.com/Tomi-whizzy/StellarInsure/issues/208) [#211](https://github.com/Tomi-whizzy/StellarInsure/issues/211) [#212](https://github.com/Tomi-whizzy/StellarInsure/issues/212) [#215](https://github.com/Tomi-whizzy/StellarInsure/issues/215) resolve frontend & docker issues ([29a6d2a](https://github.com/Tomi-whizzy/StellarInsure/commit/29a6d2ac37f8c2e32169914185bdd0684615cb59))
* add config guards and transaction filter validation ([809d1aa](https://github.com/Tomi-whizzy/StellarInsure/commit/809d1aa4c5f5ca917b4bdd8a184d8b81da4296a9))
* backend validation and pagination improvements ([f5541a4](https://github.com/Tomi-whizzy/StellarInsure/commit/f5541a464fa0240f573d9ed4b96b6e421b91387d)), closes [#358](https://github.com/Tomi-whizzy/StellarInsure/issues/358) [#355](https://github.com/Tomi-whizzy/StellarInsure/issues/355) [#361](https://github.com/Tomi-whizzy/StellarInsure/issues/361) [#362](https://github.com/Tomi-whizzy/StellarInsure/issues/362) [#358](https://github.com/Tomi-whizzy/StellarInsure/issues/358) [#355](https://github.com/Tomi-whizzy/StellarInsure/issues/355) [#361](https://github.com/Tomi-whizzy/StellarInsure/issues/361) [#362](https://github.com/Tomi-whizzy/StellarInsure/issues/362)
* **ci:** add backend deployment pipeline with migrations and rollback ([2a250ba](https://github.com/Tomi-whizzy/StellarInsure/commit/2a250ba523df1335da8784c74fb6b3bbc165c3ce))
* **ci:** add Trivy security scanning workflow ([0c7272e](https://github.com/Tomi-whizzy/StellarInsure/commit/0c7272eec002e635e14f1fcc98e88f8ed306efd7)), closes [ChaoLing140/StellarInsure#218](https://github.com/ChaoLing140/StellarInsure/issues/218)
* **frontend:** improve skip-link focus handling ([#144](https://github.com/Tomi-whizzy/StellarInsure/issues/144)) ([47ac771](https://github.com/Tomi-whizzy/StellarInsure/commit/47ac771b0a2064cdae55dedffc12f9287a28e4c5))
* improve header and notifications accessibility ([823e57f](https://github.com/Tomi-whizzy/StellarInsure/commit/823e57f569e5bb58bfe8aa9062d6a5c695c6b968))
* preserve trigger condition builder value from saved draft ([ac4fe2a](https://github.com/Tomi-whizzy/StellarInsure/commit/ac4fe2a3f5e569fe40d9564a08f7b84821328013))
* render pending policy cards without hash href ([40a19ed](https://github.com/Tomi-whizzy/StellarInsure/commit/40a19ed985770a55f473befda244475381770b11))
* replace console.log with proper logging mechanism ([761346c](https://github.com/Tomi-whizzy/StellarInsure/commit/761346c23109b0f76562167ef59354582937ade8)), closes [#282](https://github.com/Tomi-whizzy/StellarInsure/issues/282)
* replace raw HTTPException with custom errors in storage service ([39794f8](https://github.com/Tomi-whizzy/StellarInsure/commit/39794f8abfc53fa47c0ad4a23fac518a08f4a45f))
* resolve issues [#307](https://github.com/Tomi-whizzy/StellarInsure/issues/307), [#309](https://github.com/Tomi-whizzy/StellarInsure/issues/309), [#311](https://github.com/Tomi-whizzy/StellarInsure/issues/311), [#314](https://github.com/Tomi-whizzy/StellarInsure/issues/314) ([18b1edc](https://github.com/Tomi-whizzy/StellarInsure/commit/18b1edc55415eef12d53571212569607fd8d2440))
* resolve issues [#317](https://github.com/Tomi-whizzy/StellarInsure/issues/317), [#324](https://github.com/Tomi-whizzy/StellarInsure/issues/324), [#325](https://github.com/Tomi-whizzy/StellarInsure/issues/325), [#326](https://github.com/Tomi-whizzy/StellarInsure/issues/326) ([a2b6e02](https://github.com/Tomi-whizzy/StellarInsure/commit/a2b6e02b95c6ca7214331cded4e06578a3fbbad6))
* resolve issues [#330](https://github.com/Tomi-whizzy/StellarInsure/issues/330), [#335](https://github.com/Tomi-whizzy/StellarInsure/issues/335), [#337](https://github.com/Tomi-whizzy/StellarInsure/issues/337), [#344](https://github.com/Tomi-whizzy/StellarInsure/issues/344) (frontend improvements) ([959ab5f](https://github.com/Tomi-whizzy/StellarInsure/commit/959ab5f418f48a47b491748b5624ba87d03b1149))
* resolve issues [#387](https://github.com/Tomi-whizzy/StellarInsure/issues/387), [#395](https://github.com/Tomi-whizzy/StellarInsure/issues/395), [#400](https://github.com/Tomi-whizzy/StellarInsure/issues/400), [#401](https://github.com/Tomi-whizzy/StellarInsure/issues/401) ([83b0c13](https://github.com/Tomi-whizzy/StellarInsure/commit/83b0c13a0d664cd105d91445752972a61fcf7172))
* resolve lint errors and add missing icon definitions ([ea7df54](https://github.com/Tomi-whizzy/StellarInsure/commit/ea7df54fb2ac82cdd9f159cd84288f5c7600dd65))
* restrict CORS to specific origins for security ([440eb67](https://github.com/Tomi-whizzy/StellarInsure/commit/440eb673db36fcaf499f1092990a94565d6f90da))
* standardize error handling, add icon aria-hidden, document contract state vars ([1dd3967](https://github.com/Tomi-whizzy/StellarInsure/commit/1dd39678b9396758b665ba4952754b09d8910ac1)), closes [#277](https://github.com/Tomi-whizzy/StellarInsure/issues/277) [#276](https://github.com/Tomi-whizzy/StellarInsure/issues/276) [#279](https://github.com/Tomi-whizzy/StellarInsure/issues/279) [#276](https://github.com/Tomi-whizzy/StellarInsure/issues/276) [#277](https://github.com/Tomi-whizzy/StellarInsure/issues/277) [#279](https://github.com/Tomi-whizzy/StellarInsure/issues/279)
* **table:** improve table semantics and accessibility ([30be705](https://github.com/Tomi-whizzy/StellarInsure/commit/30be705a5e80ebb5d3c4d47f05ec5db28bb2c675)), closes [#143](https://github.com/Tomi-whizzy/StellarInsure/issues/143)


### Features

* **#124:** Add retry UI for failed transactions ([2b87699](https://github.com/Tomi-whizzy/StellarInsure/commit/2b87699890ffc0be702a71873ef1c0cc79fdc88d)), closes [#124](https://github.com/Tomi-whizzy/StellarInsure/issues/124)
* add claim flow polish, CODEOWNERS, release workflow, and component tests ([96180ec](https://github.com/Tomi-whizzy/StellarInsure/commit/96180ecdd825950c9089a3ec2b94f080a4769fee)), closes [#205](https://github.com/Tomi-whizzy/StellarInsure/issues/205) [#216](https://github.com/Tomi-whizzy/StellarInsure/issues/216) [#217](https://github.com/Tomi-whizzy/StellarInsure/issues/217) [#222](https://github.com/Tomi-whizzy/StellarInsure/issues/222) [#205](https://github.com/Tomi-whizzy/StellarInsure/issues/205) [#216](https://github.com/Tomi-whizzy/StellarInsure/issues/216) [#217](https://github.com/Tomi-whizzy/StellarInsure/issues/217) [#222](https://github.com/Tomi-whizzy/StellarInsure/issues/222)
* add claim form error summary with field navigation ([#340](https://github.com/Tomi-whizzy/StellarInsure/issues/340)) ([727f69a](https://github.com/Tomi-whizzy/StellarInsure/commit/727f69a8681119901d78ff0f2d82709ea6e335f0))
* add comprehensive input validation with Pydantic ([bfc8e99](https://github.com/Tomi-whizzy/StellarInsure/commit/bfc8e995758742d251bca0ac639409d377eef358))
* add contract events risk pool and test coverage ([e78c957](https://github.com/Tomi-whizzy/StellarInsure/commit/e78c9573ee27a77059c978bf870212aa323ef455))
* add formatted coverage amount inputs for [#73](https://github.com/Tomi-whizzy/StellarInsure/issues/73) ([c356b70](https://github.com/Tomi-whizzy/StellarInsure/commit/c356b701cf14dd6fc741f4a650f5bbcddfaf952d))
* add frontend quality improvements and ci workflows ([c00876b](https://github.com/Tomi-whizzy/StellarInsure/commit/c00876b9a8a81d798751916d33d560c0c3170cef))
* add global rate limiting to gateway ([0995c90](https://github.com/Tomi-whizzy/StellarInsure/commit/0995c90cf2b353698d9e411a8dd01c2f4270c772))
* add i18n support to policies page filters ([1436aac](https://github.com/Tomi-whizzy/StellarInsure/commit/1436aacbcec39bd92f6c36e7f784ed9b865657e3))
* add i18n support to settings page ([985f176](https://github.com/Tomi-whizzy/StellarInsure/commit/985f176faeb28afcb380fefbe54ad8e1f1eef2a0))
* add k8s manifests and staging deployment workflow ([31ef8ef](https://github.com/Tomi-whizzy/StellarInsure/commit/31ef8eff8456644def03f68d3f542e035a9c57bd))
* add PostgreSQL connection pooling configuration ([4a7ccfa](https://github.com/Tomi-whizzy/StellarInsure/commit/4a7ccfaa88117e6deb592b425b4229ea1a744b6d))
* added network swticher ([ec3a2a8](https://github.com/Tomi-whizzy/StellarInsure/commit/ec3a2a802fc503d5d2827893d26c3b8fe835d19e))
* added partial claim support to contracts ([761ab03](https://github.com/Tomi-whizzy/StellarInsure/commit/761ab03cd8ef2f313eeec9dc1bfe5387f763ecb7))
* addede the fixes ([313064e](https://github.com/Tomi-whizzy/StellarInsure/commit/313064e9588ed8b8004baca80aca5c6f2efdc778))
* **analytics:** integrate date range picker with preset shortcuts into dashboard ([5d2aa04](https://github.com/Tomi-whizzy/StellarInsure/commit/5d2aa04bc4cd9e5c56045680976ec1047540b083))
* API error boundaries, offline banner, unsaved guard, reduced-motion ([#125](https://github.com/Tomi-whizzy/StellarInsure/issues/125) [#126](https://github.com/Tomi-whizzy/StellarInsure/issues/126) [#122](https://github.com/Tomi-whizzy/StellarInsure/issues/122) [#139](https://github.com/Tomi-whizzy/StellarInsure/issues/139)) ([d5d1ad2](https://github.com/Tomi-whizzy/StellarInsure/commit/d5d1ad29f6ca84efebb552fec8fd74153a0bf7bf))
* **backend:** add environment config, rate limiting, Redis caching, and webhook notifications ([6d6a2bc](https://github.com/Tomi-whizzy/StellarInsure/commit/6d6a2bca402d17b7a0618540d12ce6939e1872e0)), closes [#48](https://github.com/Tomi-whizzy/StellarInsure/issues/48) [#11](https://github.com/Tomi-whizzy/StellarInsure/issues/11) [#9](https://github.com/Tomi-whizzy/StellarInsure/issues/9) [#49](https://github.com/Tomi-whizzy/StellarInsure/issues/49)
* build policy summary review step for [#78](https://github.com/Tomi-whizzy/StellarInsure/issues/78) ([92564cf](https://github.com/Tomi-whizzy/StellarInsure/commit/92564cfbb56ae56fa360825375e80a7a3fc9d3f3))
* **build:** configure route-level code splitting ([9605f69](https://github.com/Tomi-whizzy/StellarInsure/commit/9605f69c8556cfccb6c8b0235ffa412deefbf114)), closes [#150](https://github.com/Tomi-whizzy/StellarInsure/issues/150)
* **claims:** add payout breakdown component with line items and status badge ([53b285b](https://github.com/Tomi-whizzy/StellarInsure/commit/53b285b6a656a3f5d7c4df53cdb1ace957226163))
* **claims:** implement claim submission form with evidence inputs and preview ([6743314](https://github.com/Tomi-whizzy/StellarInsure/commit/674331467d53d0ce54a96c4151e3bcd571dc4169))
* **components:** add accessible popover primitive ([c1928e6](https://github.com/Tomi-whizzy/StellarInsure/commit/c1928e6ac52f2873eb8e2aec48a8c4c66604b08e)), closes [#146](https://github.com/Tomi-whizzy/StellarInsure/issues/146)
* **contracts:** implement claim payout verification and treasury tracking ([#20](https://github.com/Tomi-whizzy/StellarInsure/issues/20)) ([dc4ad59](https://github.com/Tomi-whizzy/StellarInsure/commit/dc4ad5945d615b4820a94bf234fe80f9bbbaecda))
* **contracts:** implement policy expiration checking ([#18](https://github.com/Tomi-whizzy/StellarInsure/issues/18)) ([4e22353](https://github.com/Tomi-whizzy/StellarInsure/commit/4e22353f2013214c222ea230a6237b3635745332))
* **create:** add visible autosave status indicator ([0b4fb0b](https://github.com/Tomi-whizzy/StellarInsure/commit/0b4fb0be546be2d609ef5e5430739be9519645b1)), closes [#328](https://github.com/Tomi-whizzy/StellarInsure/issues/328)
* **create:** add visible autosave status on create policy ([4171f71](https://github.com/Tomi-whizzy/StellarInsure/commit/4171f71ea10501f990fc1218128e194783ca361b)), closes [#328](https://github.com/Tomi-whizzy/StellarInsure/issues/328)
* **create:** localize remaining hardcoded receipt copy ([d646fc7](https://github.com/Tomi-whizzy/StellarInsure/commit/d646fc7fcfdd0ee056fd89c35692a6103b1e3cbd)), closes [#331](https://github.com/Tomi-whizzy/StellarInsure/issues/331)
* fix issues [#285](https://github.com/Tomi-whizzy/StellarInsure/issues/285) and [#283](https://github.com/Tomi-whizzy/StellarInsure/issues/283) ([4ecde49](https://github.com/Tomi-whizzy/StellarInsure/commit/4ecde499a25d4a15ff787b94834bdb6a586cc6ed))
* **frontend:** add claim eligibility pre-check UI ([f94f20c](https://github.com/Tomi-whizzy/StellarInsure/commit/f94f20c2d5b3e1415ed1f5456dfd93766ad63b69)), closes [#93](https://github.com/Tomi-whizzy/StellarInsure/issues/93)
* **frontend:** add keyboard shortcuts help modal ([86386ef](https://github.com/Tomi-whizzy/StellarInsure/commit/86386efcdbf969a05cd75cd6c15e90acb4d58a20)), closes [ChaoLing140/StellarInsure#111](https://github.com/ChaoLing140/StellarInsure/issues/111)
* **frontend:** add pending transaction timeline ([680a735](https://github.com/Tomi-whizzy/StellarInsure/commit/680a73500a2465d214643eb9f731384082405e73)), closes [#81](https://github.com/Tomi-whizzy/StellarInsure/issues/81)
* **frontend:** add reusable modal, drawer, pagination, file validation, and policy selector components ([74dc5d8](https://github.com/Tomi-whizzy/StellarInsure/commit/74dc5d858738ceae4468b05456a4aab1d74b9930)), closes [#113](https://github.com/Tomi-whizzy/StellarInsure/issues/113) [#115](https://github.com/Tomi-whizzy/StellarInsure/issues/115) [#118](https://github.com/Tomi-whizzy/StellarInsure/issues/118) [#112](https://github.com/Tomi-whizzy/StellarInsure/issues/112)
* **frontend:** add reusable route seo metadata ([e3bdfc4](https://github.com/Tomi-whizzy/StellarInsure/commit/e3bdfc4a11b7543764a8a3d1107cc9d4e37b8361))
* **frontend:** build policy creation page shell with stepper layout ([c2b2ad0](https://github.com/Tomi-whizzy/StellarInsure/commit/c2b2ad0ba738969ebd4a561a15ceb2b1ff18596d)), closes [#71](https://github.com/Tomi-whizzy/StellarInsure/issues/71)
* **frontend:** create transaction confirmation modal ([cbe204b](https://github.com/Tomi-whizzy/StellarInsure/commit/cbe204bb2dd10f4460dae3fbf97f5b24c452fd32)), closes [#80](https://github.com/Tomi-whizzy/StellarInsure/issues/80)
* **frontend:** create trigger-builder, premium-estimate, and validation-summary components ([#76](https://github.com/Tomi-whizzy/StellarInsure/issues/76), [#74](https://github.com/Tomi-whizzy/StellarInsure/issues/74), [#84](https://github.com/Tomi-whizzy/StellarInsure/issues/84)) ([89980ed](https://github.com/Tomi-whizzy/StellarInsure/commit/89980edd4dcf51e2c92a8888af0c61b10b51b76f))
* **frontend:** expand settings page with account, preferences, and security sections ([2f23a39](https://github.com/Tomi-whizzy/StellarInsure/commit/2f23a39fd39c4b5de3a7bd2d9acb2474bf0894e4)), closes [#99](https://github.com/Tomi-whizzy/StellarInsure/issues/99)
* **frontend:** implement loading skeleton library ([4c6f387](https://github.com/Tomi-whizzy/StellarInsure/commit/4c6f3872d64f915118b08340b2ce6fb0da13eb2b)), closes [#85](https://github.com/Tomi-whizzy/StellarInsure/issues/85)
* **frontend:** implement notifications center panel component ([8443dd6](https://github.com/Tomi-whizzy/StellarInsure/commit/8443dd62f4738e7028f4c6eebff3b6eacbcb63ed)), closes [#97](https://github.com/Tomi-whizzy/StellarInsure/issues/97)
* **frontend:** implement policy draft autosave ([935ed13](https://github.com/Tomi-whizzy/StellarInsure/commit/935ed13f55e1238f51f4aae9a43caaa28c268e7b)), closes [#79](https://github.com/Tomi-whizzy/StellarInsure/issues/79)
* **frontend:** implement policy type selector cards ([ade8f80](https://github.com/Tomi-whizzy/StellarInsure/commit/ade8f80903f05afbccc79b3bd09ed44b2b49f0c1)), closes [#72](https://github.com/Tomi-whizzy/StellarInsure/issues/72)
* **frontend:** implement responsive mobile bottom navigation ([#131](https://github.com/Tomi-whizzy/StellarInsure/issues/131)) ([b7da18a](https://github.com/Tomi-whizzy/StellarInsure/commit/b7da18a0844d120c92ba268175b2188c80b283cf))
* **frontend:** improve policy detail usability ([06b9e74](https://github.com/Tomi-whizzy/StellarInsure/commit/06b9e74830ddc90b056bae456f1c09c757437cc3))
* **frontend:** integrate condition builder, premium estimate, and validation summary ([#76](https://github.com/Tomi-whizzy/StellarInsure/issues/76), [#74](https://github.com/Tomi-whizzy/StellarInsure/issues/74), [#84](https://github.com/Tomi-whizzy/StellarInsure/issues/84)) ([c1b14e3](https://github.com/Tomi-whizzy/StellarInsure/commit/c1b14e3857333365318a259bc7f9bab9d9dddcd1))
* implement [#189](https://github.com/Tomi-whizzy/StellarInsure/issues/189) transactions endpoint, [#187](https://github.com/Tomi-whizzy/StellarInsure/issues/187) stellar signature verification, [#196](https://github.com/Tomi-whizzy/StellarInsure/issues/196) multiple claims support, [#188](https://github.com/Tomi-whizzy/StellarInsure/issues/188) JWT blacklisting ([61fcdd5](https://github.com/Tomi-whizzy/StellarInsure/commit/61fcdd5a4cbf37a4dbb15d358c0a25f7b9abd41a))
* implement claim endpoints with file upload support ([f52f40d](https://github.com/Tomi-whizzy/StellarInsure/commit/f52f40d47cfe33a93f5d53cc04c7e56e78eda776))
* implement claim endpoints with file upload support ([8438a05](https://github.com/Tomi-whizzy/StellarInsure/commit/8438a05004f3453befd78be51d4d00dda6a7795e))
* implement dark mode with theme toggle and system preference support ([4b8f35f](https://github.com/Tomi-whizzy/StellarInsure/commit/4b8f35f72c6a777276f3c262e1e9d8db91b9e2c8))
* implement database models with SQLAlchemy ([06814fa](https://github.com/Tomi-whizzy/StellarInsure/commit/06814fa2efbb8d66955e81fb0cc06392787b22d4))
* implement frontend issues [#119](https://github.com/Tomi-whizzy/StellarInsure/issues/119), [#117](https://github.com/Tomi-whizzy/StellarInsure/issues/117), [#120](https://github.com/Tomi-whizzy/StellarInsure/issues/120), [#116](https://github.com/Tomi-whizzy/StellarInsure/issues/116) ([eaf53cb](https://github.com/Tomi-whizzy/StellarInsure/commit/eaf53cba795d8234dec61d473be9b23d9e8a7a96))
* implement frontend issues [#91](https://github.com/Tomi-whizzy/StellarInsure/issues/91), [#95](https://github.com/Tomi-whizzy/StellarInsure/issues/95), [#121](https://github.com/Tomi-whizzy/StellarInsure/issues/121), [#123](https://github.com/Tomi-whizzy/StellarInsure/issues/123) ([499a80a](https://github.com/Tomi-whizzy/StellarInsure/commit/499a80ae4f651d9d29567d762fe1443de24795c1))
* implement issue [#207](https://github.com/Tomi-whizzy/StellarInsure/issues/207) - API client integration ([2032b2c](https://github.com/Tomi-whizzy/StellarInsure/commit/2032b2c22fe0e6340360074869d91fab5b4f39a0))
* implement issues [#21](https://github.com/Tomi-whizzy/StellarInsure/issues/21), [#30](https://github.com/Tomi-whizzy/StellarInsure/issues/30), [#32](https://github.com/Tomi-whizzy/StellarInsure/issues/32), [#47](https://github.com/Tomi-whizzy/StellarInsure/issues/47) ([9bf8602](https://github.com/Tomi-whizzy/StellarInsure/commit/9bf860204d296fc259d2d4a0b4889626972df105))
* implement issues [#228](https://github.com/Tomi-whizzy/StellarInsure/issues/228), [#300](https://github.com/Tomi-whizzy/StellarInsure/issues/300), [#305](https://github.com/Tomi-whizzy/StellarInsure/issues/305), [#306](https://github.com/Tomi-whizzy/StellarInsure/issues/306) ([beccdfe](https://github.com/Tomi-whizzy/StellarInsure/commit/beccdfef7003d247f75a142581a247322107b069))
* implement issues [#367](https://github.com/Tomi-whizzy/StellarInsure/issues/367), [#373](https://github.com/Tomi-whizzy/StellarInsure/issues/373), [#375](https://github.com/Tomi-whizzy/StellarInsure/issues/375), [#381](https://github.com/Tomi-whizzy/StellarInsure/issues/381) ([3cd2072](https://github.com/Tomi-whizzy/StellarInsure/commit/3cd20723d95740b26d83c749d7c7d3d51ba3262e))
* implement JWT authentication system ([2df9dd2](https://github.com/Tomi-whizzy/StellarInsure/commit/2df9dd271dbcb526b832fcf733d5f9d7c1c7e47d))
* implement policy endpoints with pagination and filtering ([e868b1c](https://github.com/Tomi-whizzy/StellarInsure/commit/e868b1c6e7a306f398d0c962908c0c956aa57c0c))
* implement status pills, sortable policy table, onboarding checklist, and withdrawal flow ([4629294](https://github.com/Tomi-whizzy/StellarInsure/commit/4629294d89f632b421bc50ae2d3a78f09f39473c))
* implement Stellar smart contract integration ([bd66b5a](https://github.com/Tomi-whizzy/StellarInsure/commit/bd66b5a1d56e63a56cd83a9d78c9c4c02b6f0d0e))
* implement token transfers and backend testing factories ([a30df2d](https://github.com/Tomi-whizzy/StellarInsure/commit/a30df2d8c529f47b5ae2950c5bc0a61af3ee6acb))
* implement transaction history, onboarding flow, backend logging, and contract upgradeability ([8800f2f](https://github.com/Tomi-whizzy/StellarInsure/commit/8800f2f0e78ba072ff793b30b7bafaf485c79ff1))
* initial commit - StellarInsure parametric insurance protocol ([9a883eb](https://github.com/Tomi-whizzy/StellarInsure/commit/9a883ebda635bb61c3cd41d78c26eeecf0e3e5e3))
* **metrics:** add chart data table fallback for policy metrics ([7ee308f](https://github.com/Tomi-whizzy/StellarInsure/commit/7ee308fd4e78bfa9a87840bf0dd183ec20ab1aae)), closes [#346](https://github.com/Tomi-whizzy/StellarInsure/issues/346)
* multi-sig admin ([#16](https://github.com/Tomi-whizzy/StellarInsure/issues/16)), policy renewal ([#22](https://github.com/Tomi-whizzy/StellarInsure/issues/22)), integration tests ([#29](https://github.com/Tomi-whizzy/StellarInsure/issues/29)), emergency pause ([#51](https://github.com/Tomi-whizzy/StellarInsure/issues/51)) ([48c88f0](https://github.com/Tomi-whizzy/StellarInsure/commit/48c88f0b8821297da48ef0da16c9aea5eb669e90))
* **policies:** fix aria labels, remove any types, persist view mode, add result count ([7381748](https://github.com/Tomi-whizzy/StellarInsure/commit/73817485d2eb582b9e0e139fe711f4b992c1bdce)), closes [#312](https://github.com/Tomi-whizzy/StellarInsure/issues/312) [#313](https://github.com/Tomi-whizzy/StellarInsure/issues/313) [#310](https://github.com/Tomi-whizzy/StellarInsure/issues/310) [#316](https://github.com/Tomi-whizzy/StellarInsure/issues/316) [#310](https://github.com/Tomi-whizzy/StellarInsure/issues/310) [#312](https://github.com/Tomi-whizzy/StellarInsure/issues/312) [#313](https://github.com/Tomi-whizzy/StellarInsure/issues/313) [#316](https://github.com/Tomi-whizzy/StellarInsure/issues/316)
* policy list filter ([654ec50](https://github.com/Tomi-whizzy/StellarInsure/commit/654ec50663dff595c541d8503924bd53b52ed54a))
* **pools:** add risk pool deposit flow with multi-step UI and utilization display ([6ee8b55](https://github.com/Tomi-whizzy/StellarInsure/commit/6ee8b55b49e7e65648699b977d72ae8071d94b30))
* premium calculation, mutation testing, and legal pages ([c7f4d1f](https://github.com/Tomi-whizzy/StellarInsure/commit/c7f4d1f4637e1ddbdad9676906902f89f59a158e)), closes [#17](https://github.com/Tomi-whizzy/StellarInsure/issues/17) [#52](https://github.com/Tomi-whizzy/StellarInsure/issues/52) [#128](https://github.com/Tomi-whizzy/StellarInsure/issues/128)
* resolve issue templates, layout navigation, and fuzz coverage ([704bfbe](https://github.com/Tomi-whizzy/StellarInsure/commit/704bfbe3870619f081b0681b7336e4a09d3d6615))
* resolve multiple backend and contract issues ([80d6697](https://github.com/Tomi-whizzy/StellarInsure/commit/80d66978af56fce714dc1226aad6f689e6cdc7a2)), closes [#190](https://github.com/Tomi-whizzy/StellarInsure/issues/190) [#186](https://github.com/Tomi-whizzy/StellarInsure/issues/186) [#192](https://github.com/Tomi-whizzy/StellarInsure/issues/192) [#195](https://github.com/Tomi-whizzy/StellarInsure/issues/195) [#190](https://github.com/Tomi-whizzy/StellarInsure/issues/190) [#186](https://github.com/Tomi-whizzy/StellarInsure/issues/186) [#192](https://github.com/Tomi-whizzy/StellarInsure/issues/192) [#195](https://github.com/Tomi-whizzy/StellarInsure/issues/195)
* scaffold accessible tooltip component with hover/focus/blur handlers ([52bc8d4](https://github.com/Tomi-whizzy/StellarInsure/commit/52bc8d42f6b595c636b7adc4c272d58aa47c2f05))
* **settings:** add arrow key navigation to settings tabs ([8181794](https://github.com/Tomi-whizzy/StellarInsure/commit/818179476f1f0069a68b6c398a491f924083f42b)), closes [#336](https://github.com/Tomi-whizzy/StellarInsure/issues/336)
* tighten radius tokens, fix dark accent contrast, add hero preview, flush features section ([01fd4fb](https://github.com/Tomi-whizzy/StellarInsure/commit/01fd4fb0e9a49092b328d51a812e13065a847cd0)), closes [#319](https://github.com/Tomi-whizzy/StellarInsure/issues/319) [#320](https://github.com/Tomi-whizzy/StellarInsure/issues/320) [#321](https://github.com/Tomi-whizzy/StellarInsure/issues/321) [#323](https://github.com/Tomi-whizzy/StellarInsure/issues/323)
* unread badge, coverage range guard, /create CTA, responsive skeleton ([30adf9b](https://github.com/Tomi-whizzy/StellarInsure/commit/30adf9b454aea461eac8bc57882a16e3587952ed)), closes [#302](https://github.com/Tomi-whizzy/StellarInsure/issues/302) [#318](https://github.com/Tomi-whizzy/StellarInsure/issues/318) [#308](https://github.com/Tomi-whizzy/StellarInsure/issues/308) [#339](https://github.com/Tomi-whizzy/StellarInsure/issues/339)
* Update Next.js, fix CSS variables, add oracle integration ([0736d07](https://github.com/Tomi-whizzy/StellarInsure/commit/0736d07694c5e06bd16ac4518366ded486f76e15)), closes [#275](https://github.com/Tomi-whizzy/StellarInsure/issues/275) [#280](https://github.com/Tomi-whizzy/StellarInsure/issues/280) [#198](https://github.com/Tomi-whizzy/StellarInsure/issues/198)

# [1.30.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.29.0...v1.30.0) (2026-05-30)


### Bug Fixes

* preserve trigger condition builder value from saved draft ([ac4fe2a](https://github.com/ChaoLing140/StellarInsure/commit/ac4fe2a3f5e569fe40d9564a08f7b84821328013))
* replace raw HTTPException with custom errors in storage service ([39794f8](https://github.com/ChaoLing140/StellarInsure/commit/39794f8abfc53fa47c0ad4a23fac518a08f4a45f))
* resolve issues [#387](https://github.com/ChaoLing140/StellarInsure/issues/387), [#395](https://github.com/ChaoLing140/StellarInsure/issues/395), [#400](https://github.com/ChaoLing140/StellarInsure/issues/400), [#401](https://github.com/ChaoLing140/StellarInsure/issues/401) ([83b0c13](https://github.com/ChaoLing140/StellarInsure/commit/83b0c13a0d664cd105d91445752972a61fcf7172))


### Features

* add i18n support to policies page filters ([1436aac](https://github.com/ChaoLing140/StellarInsure/commit/1436aacbcec39bd92f6c36e7f784ed9b865657e3))
* add i18n support to settings page ([985f176](https://github.com/ChaoLing140/StellarInsure/commit/985f176faeb28afcb380fefbe54ad8e1f1eef2a0))

# [1.29.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.28.1...v1.29.0) (2026-05-30)


### Features

* implement issues [#367](https://github.com/ChaoLing140/StellarInsure/issues/367), [#373](https://github.com/ChaoLing140/StellarInsure/issues/373), [#375](https://github.com/ChaoLing140/StellarInsure/issues/375), [#381](https://github.com/ChaoLing140/StellarInsure/issues/381) ([3cd2072](https://github.com/ChaoLing140/StellarInsure/commit/3cd20723d95740b26d83c749d7c7d3d51ba3262e))

## [1.28.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.28.0...v1.28.1) (2026-05-30)


### Bug Fixes

* add config guards and transaction filter validation ([809d1aa](https://github.com/ChaoLing140/StellarInsure/commit/809d1aa4c5f5ca917b4bdd8a184d8b81da4296a9))

# [1.28.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.27.2...v1.28.0) (2026-05-29)


### Features

* unread badge, coverage range guard, /create CTA, responsive skeleton ([30adf9b](https://github.com/ChaoLing140/StellarInsure/commit/30adf9b454aea461eac8bc57882a16e3587952ed)), closes [#302](https://github.com/ChaoLing140/StellarInsure/issues/302) [#318](https://github.com/ChaoLing140/StellarInsure/issues/318) [#308](https://github.com/ChaoLing140/StellarInsure/issues/308) [#339](https://github.com/ChaoLing140/StellarInsure/issues/339)

## [1.27.2](https://github.com/ChaoLing140/StellarInsure/compare/v1.27.1...v1.27.2) (2026-05-29)


### Bug Fixes

* render pending policy cards without hash href ([40a19ed](https://github.com/ChaoLing140/StellarInsure/commit/40a19ed985770a55f473befda244475381770b11))

## [1.27.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.27.0...v1.27.1) (2026-05-29)


### Bug Fixes

* backend validation and pagination improvements ([f5541a4](https://github.com/ChaoLing140/StellarInsure/commit/f5541a464fa0240f573d9ed4b96b6e421b91387d)), closes [#358](https://github.com/ChaoLing140/StellarInsure/issues/358) [#355](https://github.com/ChaoLing140/StellarInsure/issues/355) [#361](https://github.com/ChaoLing140/StellarInsure/issues/361) [#362](https://github.com/ChaoLing140/StellarInsure/issues/362) [#358](https://github.com/ChaoLing140/StellarInsure/issues/358) [#355](https://github.com/ChaoLing140/StellarInsure/issues/355) [#361](https://github.com/ChaoLing140/StellarInsure/issues/361) [#362](https://github.com/ChaoLing140/StellarInsure/issues/362)

# [1.27.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.26.3...v1.27.0) (2026-05-29)


### Features

* **create:** add visible autosave status indicator ([0b4fb0b](https://github.com/ChaoLing140/StellarInsure/commit/0b4fb0be546be2d609ef5e5430739be9519645b1)), closes [#328](https://github.com/ChaoLing140/StellarInsure/issues/328)
* **create:** add visible autosave status on create policy ([4171f71](https://github.com/ChaoLing140/StellarInsure/commit/4171f71ea10501f990fc1218128e194783ca361b)), closes [#328](https://github.com/ChaoLing140/StellarInsure/issues/328)
* **create:** localize remaining hardcoded receipt copy ([d646fc7](https://github.com/ChaoLing140/StellarInsure/commit/d646fc7fcfdd0ee056fd89c35692a6103b1e3cbd)), closes [#331](https://github.com/ChaoLing140/StellarInsure/issues/331)
* **metrics:** add chart data table fallback for policy metrics ([7ee308f](https://github.com/ChaoLing140/StellarInsure/commit/7ee308fd4e78bfa9a87840bf0dd183ec20ab1aae)), closes [#346](https://github.com/ChaoLing140/StellarInsure/issues/346)
* **settings:** add arrow key navigation to settings tabs ([8181794](https://github.com/ChaoLing140/StellarInsure/commit/818179476f1f0069a68b6c398a491f924083f42b)), closes [#336](https://github.com/ChaoLing140/StellarInsure/issues/336)

## [1.26.3](https://github.com/ChaoLing140/StellarInsure/compare/v1.26.2...v1.26.3) (2026-05-29)


### Bug Fixes

* resolve issues [#307](https://github.com/ChaoLing140/StellarInsure/issues/307), [#309](https://github.com/ChaoLing140/StellarInsure/issues/309), [#311](https://github.com/ChaoLing140/StellarInsure/issues/311), [#314](https://github.com/ChaoLing140/StellarInsure/issues/314) ([18b1edc](https://github.com/ChaoLing140/StellarInsure/commit/18b1edc55415eef12d53571212569607fd8d2440))

## [1.26.2](https://github.com/ChaoLing140/StellarInsure/compare/v1.26.1...v1.26.2) (2026-05-29)


### Bug Fixes

* improve header and notifications accessibility ([823e57f](https://github.com/ChaoLing140/StellarInsure/commit/823e57f569e5bb58bfe8aa9062d6a5c695c6b968))

## [1.26.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.26.0...v1.26.1) (2026-05-29)


### Bug Fixes

* resolve issues [#330](https://github.com/ChaoLing140/StellarInsure/issues/330), [#335](https://github.com/ChaoLing140/StellarInsure/issues/335), [#337](https://github.com/ChaoLing140/StellarInsure/issues/337), [#344](https://github.com/ChaoLing140/StellarInsure/issues/344) (frontend improvements) ([959ab5f](https://github.com/ChaoLing140/StellarInsure/commit/959ab5f418f48a47b491748b5624ba87d03b1149))

# 1.0.0 (2026-05-29)


### Bug Fixes

* [#208](https://github.com/johnsmccain/StellarInsure/issues/208) [#211](https://github.com/johnsmccain/StellarInsure/issues/211) [#212](https://github.com/johnsmccain/StellarInsure/issues/212) [#215](https://github.com/johnsmccain/StellarInsure/issues/215) resolve frontend & docker issues ([29a6d2a](https://github.com/johnsmccain/StellarInsure/commit/29a6d2ac37f8c2e32169914185bdd0684615cb59))
* **ci:** add backend deployment pipeline with migrations and rollback ([2a250ba](https://github.com/johnsmccain/StellarInsure/commit/2a250ba523df1335da8784c74fb6b3bbc165c3ce))
* **ci:** add Trivy security scanning workflow ([0c7272e](https://github.com/johnsmccain/StellarInsure/commit/0c7272eec002e635e14f1fcc98e88f8ed306efd7)), closes [ChaoLing140/StellarInsure#218](https://github.com/ChaoLing140/StellarInsure/issues/218)
* **frontend:** improve skip-link focus handling ([#144](https://github.com/johnsmccain/StellarInsure/issues/144)) ([47ac771](https://github.com/johnsmccain/StellarInsure/commit/47ac771b0a2064cdae55dedffc12f9287a28e4c5))
* replace console.log with proper logging mechanism ([761346c](https://github.com/johnsmccain/StellarInsure/commit/761346c23109b0f76562167ef59354582937ade8)), closes [#282](https://github.com/johnsmccain/StellarInsure/issues/282)
* resolve issues [#317](https://github.com/johnsmccain/StellarInsure/issues/317), [#324](https://github.com/johnsmccain/StellarInsure/issues/324), [#325](https://github.com/johnsmccain/StellarInsure/issues/325), [#326](https://github.com/johnsmccain/StellarInsure/issues/326) ([a2b6e02](https://github.com/johnsmccain/StellarInsure/commit/a2b6e02b95c6ca7214331cded4e06578a3fbbad6))
* resolve lint errors and add missing icon definitions ([ea7df54](https://github.com/johnsmccain/StellarInsure/commit/ea7df54fb2ac82cdd9f159cd84288f5c7600dd65))
* restrict CORS to specific origins for security ([440eb67](https://github.com/johnsmccain/StellarInsure/commit/440eb673db36fcaf499f1092990a94565d6f90da))
* standardize error handling, add icon aria-hidden, document contract state vars ([1dd3967](https://github.com/johnsmccain/StellarInsure/commit/1dd39678b9396758b665ba4952754b09d8910ac1)), closes [#277](https://github.com/johnsmccain/StellarInsure/issues/277) [#276](https://github.com/johnsmccain/StellarInsure/issues/276) [#279](https://github.com/johnsmccain/StellarInsure/issues/279) [#276](https://github.com/johnsmccain/StellarInsure/issues/276) [#277](https://github.com/johnsmccain/StellarInsure/issues/277) [#279](https://github.com/johnsmccain/StellarInsure/issues/279)
* **table:** improve table semantics and accessibility ([30be705](https://github.com/johnsmccain/StellarInsure/commit/30be705a5e80ebb5d3c4d47f05ec5db28bb2c675)), closes [#143](https://github.com/johnsmccain/StellarInsure/issues/143)


### Features

* **#124:** Add retry UI for failed transactions ([2b87699](https://github.com/johnsmccain/StellarInsure/commit/2b87699890ffc0be702a71873ef1c0cc79fdc88d)), closes [#124](https://github.com/johnsmccain/StellarInsure/issues/124)
* add claim flow polish, CODEOWNERS, release workflow, and component tests ([96180ec](https://github.com/johnsmccain/StellarInsure/commit/96180ecdd825950c9089a3ec2b94f080a4769fee)), closes [#205](https://github.com/johnsmccain/StellarInsure/issues/205) [#216](https://github.com/johnsmccain/StellarInsure/issues/216) [#217](https://github.com/johnsmccain/StellarInsure/issues/217) [#222](https://github.com/johnsmccain/StellarInsure/issues/222) [#205](https://github.com/johnsmccain/StellarInsure/issues/205) [#216](https://github.com/johnsmccain/StellarInsure/issues/216) [#217](https://github.com/johnsmccain/StellarInsure/issues/217) [#222](https://github.com/johnsmccain/StellarInsure/issues/222)
* add claim form error summary with field navigation ([#340](https://github.com/johnsmccain/StellarInsure/issues/340)) ([727f69a](https://github.com/johnsmccain/StellarInsure/commit/727f69a8681119901d78ff0f2d82709ea6e335f0))
* add comprehensive input validation with Pydantic ([bfc8e99](https://github.com/johnsmccain/StellarInsure/commit/bfc8e995758742d251bca0ac639409d377eef358))
* add contract events risk pool and test coverage ([e78c957](https://github.com/johnsmccain/StellarInsure/commit/e78c9573ee27a77059c978bf870212aa323ef455))
* add formatted coverage amount inputs for [#73](https://github.com/johnsmccain/StellarInsure/issues/73) ([c356b70](https://github.com/johnsmccain/StellarInsure/commit/c356b701cf14dd6fc741f4a650f5bbcddfaf952d))
* add frontend quality improvements and ci workflows ([c00876b](https://github.com/johnsmccain/StellarInsure/commit/c00876b9a8a81d798751916d33d560c0c3170cef))
* add global rate limiting to gateway ([0995c90](https://github.com/johnsmccain/StellarInsure/commit/0995c90cf2b353698d9e411a8dd01c2f4270c772))
* add k8s manifests and staging deployment workflow ([31ef8ef](https://github.com/johnsmccain/StellarInsure/commit/31ef8eff8456644def03f68d3f542e035a9c57bd))
* add PostgreSQL connection pooling configuration ([4a7ccfa](https://github.com/johnsmccain/StellarInsure/commit/4a7ccfaa88117e6deb592b425b4229ea1a744b6d))
* added network swticher ([ec3a2a8](https://github.com/johnsmccain/StellarInsure/commit/ec3a2a802fc503d5d2827893d26c3b8fe835d19e))
* added partial claim support to contracts ([761ab03](https://github.com/johnsmccain/StellarInsure/commit/761ab03cd8ef2f313eeec9dc1bfe5387f763ecb7))
* addede the fixes ([313064e](https://github.com/johnsmccain/StellarInsure/commit/313064e9588ed8b8004baca80aca5c6f2efdc778))
* **analytics:** integrate date range picker with preset shortcuts into dashboard ([5d2aa04](https://github.com/johnsmccain/StellarInsure/commit/5d2aa04bc4cd9e5c56045680976ec1047540b083))
* API error boundaries, offline banner, unsaved guard, reduced-motion ([#125](https://github.com/johnsmccain/StellarInsure/issues/125) [#126](https://github.com/johnsmccain/StellarInsure/issues/126) [#122](https://github.com/johnsmccain/StellarInsure/issues/122) [#139](https://github.com/johnsmccain/StellarInsure/issues/139)) ([d5d1ad2](https://github.com/johnsmccain/StellarInsure/commit/d5d1ad29f6ca84efebb552fec8fd74153a0bf7bf))
* **backend:** add environment config, rate limiting, Redis caching, and webhook notifications ([6d6a2bc](https://github.com/johnsmccain/StellarInsure/commit/6d6a2bca402d17b7a0618540d12ce6939e1872e0)), closes [#48](https://github.com/johnsmccain/StellarInsure/issues/48) [#11](https://github.com/johnsmccain/StellarInsure/issues/11) [#9](https://github.com/johnsmccain/StellarInsure/issues/9) [#49](https://github.com/johnsmccain/StellarInsure/issues/49)
* build policy summary review step for [#78](https://github.com/johnsmccain/StellarInsure/issues/78) ([92564cf](https://github.com/johnsmccain/StellarInsure/commit/92564cfbb56ae56fa360825375e80a7a3fc9d3f3))
* **build:** configure route-level code splitting ([9605f69](https://github.com/johnsmccain/StellarInsure/commit/9605f69c8556cfccb6c8b0235ffa412deefbf114)), closes [#150](https://github.com/johnsmccain/StellarInsure/issues/150)
* **claims:** add payout breakdown component with line items and status badge ([53b285b](https://github.com/johnsmccain/StellarInsure/commit/53b285b6a656a3f5d7c4df53cdb1ace957226163))
* **claims:** implement claim submission form with evidence inputs and preview ([6743314](https://github.com/johnsmccain/StellarInsure/commit/674331467d53d0ce54a96c4151e3bcd571dc4169))
* **components:** add accessible popover primitive ([c1928e6](https://github.com/johnsmccain/StellarInsure/commit/c1928e6ac52f2873eb8e2aec48a8c4c66604b08e)), closes [#146](https://github.com/johnsmccain/StellarInsure/issues/146)
* **contracts:** implement claim payout verification and treasury tracking ([#20](https://github.com/johnsmccain/StellarInsure/issues/20)) ([dc4ad59](https://github.com/johnsmccain/StellarInsure/commit/dc4ad5945d615b4820a94bf234fe80f9bbbaecda))
* **contracts:** implement policy expiration checking ([#18](https://github.com/johnsmccain/StellarInsure/issues/18)) ([4e22353](https://github.com/johnsmccain/StellarInsure/commit/4e22353f2013214c222ea230a6237b3635745332))
* fix issues [#285](https://github.com/johnsmccain/StellarInsure/issues/285) and [#283](https://github.com/johnsmccain/StellarInsure/issues/283) ([4ecde49](https://github.com/johnsmccain/StellarInsure/commit/4ecde499a25d4a15ff787b94834bdb6a586cc6ed))
* **frontend:** add claim eligibility pre-check UI ([f94f20c](https://github.com/johnsmccain/StellarInsure/commit/f94f20c2d5b3e1415ed1f5456dfd93766ad63b69)), closes [#93](https://github.com/johnsmccain/StellarInsure/issues/93)
* **frontend:** add keyboard shortcuts help modal ([86386ef](https://github.com/johnsmccain/StellarInsure/commit/86386efcdbf969a05cd75cd6c15e90acb4d58a20)), closes [ChaoLing140/StellarInsure#111](https://github.com/ChaoLing140/StellarInsure/issues/111)
* **frontend:** add pending transaction timeline ([680a735](https://github.com/johnsmccain/StellarInsure/commit/680a73500a2465d214643eb9f731384082405e73)), closes [#81](https://github.com/johnsmccain/StellarInsure/issues/81)
* **frontend:** add reusable modal, drawer, pagination, file validation, and policy selector components ([74dc5d8](https://github.com/johnsmccain/StellarInsure/commit/74dc5d858738ceae4468b05456a4aab1d74b9930)), closes [#113](https://github.com/johnsmccain/StellarInsure/issues/113) [#115](https://github.com/johnsmccain/StellarInsure/issues/115) [#118](https://github.com/johnsmccain/StellarInsure/issues/118) [#112](https://github.com/johnsmccain/StellarInsure/issues/112)
* **frontend:** add reusable route seo metadata ([e3bdfc4](https://github.com/johnsmccain/StellarInsure/commit/e3bdfc4a11b7543764a8a3d1107cc9d4e37b8361))
* **frontend:** build policy creation page shell with stepper layout ([c2b2ad0](https://github.com/johnsmccain/StellarInsure/commit/c2b2ad0ba738969ebd4a561a15ceb2b1ff18596d)), closes [#71](https://github.com/johnsmccain/StellarInsure/issues/71)
* **frontend:** create transaction confirmation modal ([cbe204b](https://github.com/johnsmccain/StellarInsure/commit/cbe204bb2dd10f4460dae3fbf97f5b24c452fd32)), closes [#80](https://github.com/johnsmccain/StellarInsure/issues/80)
* **frontend:** create trigger-builder, premium-estimate, and validation-summary components ([#76](https://github.com/johnsmccain/StellarInsure/issues/76), [#74](https://github.com/johnsmccain/StellarInsure/issues/74), [#84](https://github.com/johnsmccain/StellarInsure/issues/84)) ([89980ed](https://github.com/johnsmccain/StellarInsure/commit/89980edd4dcf51e2c92a8888af0c61b10b51b76f))
* **frontend:** expand settings page with account, preferences, and security sections ([2f23a39](https://github.com/johnsmccain/StellarInsure/commit/2f23a39fd39c4b5de3a7bd2d9acb2474bf0894e4)), closes [#99](https://github.com/johnsmccain/StellarInsure/issues/99)
* **frontend:** implement loading skeleton library ([4c6f387](https://github.com/johnsmccain/StellarInsure/commit/4c6f3872d64f915118b08340b2ce6fb0da13eb2b)), closes [#85](https://github.com/johnsmccain/StellarInsure/issues/85)
* **frontend:** implement notifications center panel component ([8443dd6](https://github.com/johnsmccain/StellarInsure/commit/8443dd62f4738e7028f4c6eebff3b6eacbcb63ed)), closes [#97](https://github.com/johnsmccain/StellarInsure/issues/97)
* **frontend:** implement policy draft autosave ([935ed13](https://github.com/johnsmccain/StellarInsure/commit/935ed13f55e1238f51f4aae9a43caaa28c268e7b)), closes [#79](https://github.com/johnsmccain/StellarInsure/issues/79)
* **frontend:** implement policy type selector cards ([ade8f80](https://github.com/johnsmccain/StellarInsure/commit/ade8f80903f05afbccc79b3bd09ed44b2b49f0c1)), closes [#72](https://github.com/johnsmccain/StellarInsure/issues/72)
* **frontend:** implement responsive mobile bottom navigation ([#131](https://github.com/johnsmccain/StellarInsure/issues/131)) ([b7da18a](https://github.com/johnsmccain/StellarInsure/commit/b7da18a0844d120c92ba268175b2188c80b283cf))
* **frontend:** improve policy detail usability ([06b9e74](https://github.com/johnsmccain/StellarInsure/commit/06b9e74830ddc90b056bae456f1c09c757437cc3))
* **frontend:** integrate condition builder, premium estimate, and validation summary ([#76](https://github.com/johnsmccain/StellarInsure/issues/76), [#74](https://github.com/johnsmccain/StellarInsure/issues/74), [#84](https://github.com/johnsmccain/StellarInsure/issues/84)) ([c1b14e3](https://github.com/johnsmccain/StellarInsure/commit/c1b14e3857333365318a259bc7f9bab9d9dddcd1))
* implement [#189](https://github.com/johnsmccain/StellarInsure/issues/189) transactions endpoint, [#187](https://github.com/johnsmccain/StellarInsure/issues/187) stellar signature verification, [#196](https://github.com/johnsmccain/StellarInsure/issues/196) multiple claims support, [#188](https://github.com/johnsmccain/StellarInsure/issues/188) JWT blacklisting ([61fcdd5](https://github.com/johnsmccain/StellarInsure/commit/61fcdd5a4cbf37a4dbb15d358c0a25f7b9abd41a))
* implement claim endpoints with file upload support ([f52f40d](https://github.com/johnsmccain/StellarInsure/commit/f52f40d47cfe33a93f5d53cc04c7e56e78eda776))
* implement claim endpoints with file upload support ([8438a05](https://github.com/johnsmccain/StellarInsure/commit/8438a05004f3453befd78be51d4d00dda6a7795e))
* implement dark mode with theme toggle and system preference support ([4b8f35f](https://github.com/johnsmccain/StellarInsure/commit/4b8f35f72c6a777276f3c262e1e9d8db91b9e2c8))
* implement database models with SQLAlchemy ([06814fa](https://github.com/johnsmccain/StellarInsure/commit/06814fa2efbb8d66955e81fb0cc06392787b22d4))
* implement frontend issues [#119](https://github.com/johnsmccain/StellarInsure/issues/119), [#117](https://github.com/johnsmccain/StellarInsure/issues/117), [#120](https://github.com/johnsmccain/StellarInsure/issues/120), [#116](https://github.com/johnsmccain/StellarInsure/issues/116) ([eaf53cb](https://github.com/johnsmccain/StellarInsure/commit/eaf53cba795d8234dec61d473be9b23d9e8a7a96))
* implement frontend issues [#91](https://github.com/johnsmccain/StellarInsure/issues/91), [#95](https://github.com/johnsmccain/StellarInsure/issues/95), [#121](https://github.com/johnsmccain/StellarInsure/issues/121), [#123](https://github.com/johnsmccain/StellarInsure/issues/123) ([499a80a](https://github.com/johnsmccain/StellarInsure/commit/499a80ae4f651d9d29567d762fe1443de24795c1))
* implement issue [#207](https://github.com/johnsmccain/StellarInsure/issues/207) - API client integration ([2032b2c](https://github.com/johnsmccain/StellarInsure/commit/2032b2c22fe0e6340360074869d91fab5b4f39a0))
* implement issues [#21](https://github.com/johnsmccain/StellarInsure/issues/21), [#30](https://github.com/johnsmccain/StellarInsure/issues/30), [#32](https://github.com/johnsmccain/StellarInsure/issues/32), [#47](https://github.com/johnsmccain/StellarInsure/issues/47) ([9bf8602](https://github.com/johnsmccain/StellarInsure/commit/9bf860204d296fc259d2d4a0b4889626972df105))
* implement issues [#228](https://github.com/johnsmccain/StellarInsure/issues/228), [#300](https://github.com/johnsmccain/StellarInsure/issues/300), [#305](https://github.com/johnsmccain/StellarInsure/issues/305), [#306](https://github.com/johnsmccain/StellarInsure/issues/306) ([beccdfe](https://github.com/johnsmccain/StellarInsure/commit/beccdfef7003d247f75a142581a247322107b069))
* implement JWT authentication system ([2df9dd2](https://github.com/johnsmccain/StellarInsure/commit/2df9dd271dbcb526b832fcf733d5f9d7c1c7e47d))
* implement policy endpoints with pagination and filtering ([e868b1c](https://github.com/johnsmccain/StellarInsure/commit/e868b1c6e7a306f398d0c962908c0c956aa57c0c))
* implement status pills, sortable policy table, onboarding checklist, and withdrawal flow ([4629294](https://github.com/johnsmccain/StellarInsure/commit/4629294d89f632b421bc50ae2d3a78f09f39473c))
* implement Stellar smart contract integration ([bd66b5a](https://github.com/johnsmccain/StellarInsure/commit/bd66b5a1d56e63a56cd83a9d78c9c4c02b6f0d0e))
* implement token transfers and backend testing factories ([a30df2d](https://github.com/johnsmccain/StellarInsure/commit/a30df2d8c529f47b5ae2950c5bc0a61af3ee6acb))
* implement transaction history, onboarding flow, backend logging, and contract upgradeability ([8800f2f](https://github.com/johnsmccain/StellarInsure/commit/8800f2f0e78ba072ff793b30b7bafaf485c79ff1))
* initial commit - StellarInsure parametric insurance protocol ([9a883eb](https://github.com/johnsmccain/StellarInsure/commit/9a883ebda635bb61c3cd41d78c26eeecf0e3e5e3))
* multi-sig admin ([#16](https://github.com/johnsmccain/StellarInsure/issues/16)), policy renewal ([#22](https://github.com/johnsmccain/StellarInsure/issues/22)), integration tests ([#29](https://github.com/johnsmccain/StellarInsure/issues/29)), emergency pause ([#51](https://github.com/johnsmccain/StellarInsure/issues/51)) ([48c88f0](https://github.com/johnsmccain/StellarInsure/commit/48c88f0b8821297da48ef0da16c9aea5eb669e90))
* **policies:** fix aria labels, remove any types, persist view mode, add result count ([7381748](https://github.com/johnsmccain/StellarInsure/commit/73817485d2eb582b9e0e139fe711f4b992c1bdce)), closes [#312](https://github.com/johnsmccain/StellarInsure/issues/312) [#313](https://github.com/johnsmccain/StellarInsure/issues/313) [#310](https://github.com/johnsmccain/StellarInsure/issues/310) [#316](https://github.com/johnsmccain/StellarInsure/issues/316) [#310](https://github.com/johnsmccain/StellarInsure/issues/310) [#312](https://github.com/johnsmccain/StellarInsure/issues/312) [#313](https://github.com/johnsmccain/StellarInsure/issues/313) [#316](https://github.com/johnsmccain/StellarInsure/issues/316)
* policy list filter ([654ec50](https://github.com/johnsmccain/StellarInsure/commit/654ec50663dff595c541d8503924bd53b52ed54a))
* **pools:** add risk pool deposit flow with multi-step UI and utilization display ([6ee8b55](https://github.com/johnsmccain/StellarInsure/commit/6ee8b55b49e7e65648699b977d72ae8071d94b30))
* premium calculation, mutation testing, and legal pages ([c7f4d1f](https://github.com/johnsmccain/StellarInsure/commit/c7f4d1f4637e1ddbdad9676906902f89f59a158e)), closes [#17](https://github.com/johnsmccain/StellarInsure/issues/17) [#52](https://github.com/johnsmccain/StellarInsure/issues/52) [#128](https://github.com/johnsmccain/StellarInsure/issues/128)
* resolve issue templates, layout navigation, and fuzz coverage ([704bfbe](https://github.com/johnsmccain/StellarInsure/commit/704bfbe3870619f081b0681b7336e4a09d3d6615))
* resolve multiple backend and contract issues ([80d6697](https://github.com/johnsmccain/StellarInsure/commit/80d66978af56fce714dc1226aad6f689e6cdc7a2)), closes [#190](https://github.com/johnsmccain/StellarInsure/issues/190) [#186](https://github.com/johnsmccain/StellarInsure/issues/186) [#192](https://github.com/johnsmccain/StellarInsure/issues/192) [#195](https://github.com/johnsmccain/StellarInsure/issues/195) [#190](https://github.com/johnsmccain/StellarInsure/issues/190) [#186](https://github.com/johnsmccain/StellarInsure/issues/186) [#192](https://github.com/johnsmccain/StellarInsure/issues/192) [#195](https://github.com/johnsmccain/StellarInsure/issues/195)
* scaffold accessible tooltip component with hover/focus/blur handlers ([52bc8d4](https://github.com/johnsmccain/StellarInsure/commit/52bc8d42f6b595c636b7adc4c272d58aa47c2f05))
* tighten radius tokens, fix dark accent contrast, add hero preview, flush features section ([01fd4fb](https://github.com/johnsmccain/StellarInsure/commit/01fd4fb0e9a49092b328d51a812e13065a847cd0)), closes [#319](https://github.com/johnsmccain/StellarInsure/issues/319) [#320](https://github.com/johnsmccain/StellarInsure/issues/320) [#321](https://github.com/johnsmccain/StellarInsure/issues/321) [#323](https://github.com/johnsmccain/StellarInsure/issues/323)
* Update Next.js, fix CSS variables, add oracle integration ([0736d07](https://github.com/johnsmccain/StellarInsure/commit/0736d07694c5e06bd16ac4518366ded486f76e15)), closes [#275](https://github.com/johnsmccain/StellarInsure/issues/275) [#280](https://github.com/johnsmccain/StellarInsure/issues/280) [#198](https://github.com/johnsmccain/StellarInsure/issues/198)

# [1.26.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.25.0...v1.26.0) (2026-05-29)


### Features

* tighten radius tokens, fix dark accent contrast, add hero preview, flush features section ([01fd4fb](https://github.com/ChaoLing140/StellarInsure/commit/01fd4fb0e9a49092b328d51a812e13065a847cd0)), closes [#319](https://github.com/ChaoLing140/StellarInsure/issues/319) [#320](https://github.com/ChaoLing140/StellarInsure/issues/320) [#321](https://github.com/ChaoLing140/StellarInsure/issues/321) [#323](https://github.com/ChaoLing140/StellarInsure/issues/323)

# [1.25.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.24.1...v1.25.0) (2026-05-28)


### Features

* add claim form error summary with field navigation ([#340](https://github.com/ChaoLing140/StellarInsure/issues/340)) ([727f69a](https://github.com/ChaoLing140/StellarInsure/commit/727f69a8681119901d78ff0f2d82709ea6e335f0))

## [1.24.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.24.0...v1.24.1) (2026-05-28)


### Bug Fixes

* resolve issues [#317](https://github.com/ChaoLing140/StellarInsure/issues/317), [#324](https://github.com/ChaoLing140/StellarInsure/issues/324), [#325](https://github.com/ChaoLing140/StellarInsure/issues/325), [#326](https://github.com/ChaoLing140/StellarInsure/issues/326) ([a2b6e02](https://github.com/ChaoLing140/StellarInsure/commit/a2b6e02b95c6ca7214331cded4e06578a3fbbad6))

# [1.24.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.23.0...v1.24.0) (2026-05-28)


### Features

* implement issues [#228](https://github.com/ChaoLing140/StellarInsure/issues/228), [#300](https://github.com/ChaoLing140/StellarInsure/issues/300), [#305](https://github.com/ChaoLing140/StellarInsure/issues/305), [#306](https://github.com/ChaoLing140/StellarInsure/issues/306) ([beccdfe](https://github.com/ChaoLing140/StellarInsure/commit/beccdfef7003d247f75a142581a247322107b069))

# [1.23.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.22.0...v1.23.0) (2026-05-28)


### Features

* **policies:** fix aria labels, remove any types, persist view mode, add result count ([7381748](https://github.com/ChaoLing140/StellarInsure/commit/73817485d2eb582b9e0e139fe711f4b992c1bdce)), closes [#312](https://github.com/ChaoLing140/StellarInsure/issues/312) [#313](https://github.com/ChaoLing140/StellarInsure/issues/313) [#310](https://github.com/ChaoLing140/StellarInsure/issues/310) [#316](https://github.com/ChaoLing140/StellarInsure/issues/316) [#310](https://github.com/ChaoLing140/StellarInsure/issues/310) [#312](https://github.com/ChaoLing140/StellarInsure/issues/312) [#313](https://github.com/ChaoLing140/StellarInsure/issues/313) [#316](https://github.com/ChaoLing140/StellarInsure/issues/316)

# [1.22.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.21.1...v1.22.0) (2026-04-30)


### Bug Fixes

* **table:** improve table semantics and accessibility ([30be705](https://github.com/ChaoLing140/StellarInsure/commit/30be705a5e80ebb5d3c4d47f05ec5db28bb2c675)), closes [#143](https://github.com/ChaoLing140/StellarInsure/issues/143)


### Features

* **build:** configure route-level code splitting ([9605f69](https://github.com/ChaoLing140/StellarInsure/commit/9605f69c8556cfccb6c8b0235ffa412deefbf114)), closes [#150](https://github.com/ChaoLing140/StellarInsure/issues/150)
* **components:** add accessible popover primitive ([c1928e6](https://github.com/ChaoLing140/StellarInsure/commit/c1928e6ac52f2873eb8e2aec48a8c4c66604b08e)), closes [#146](https://github.com/ChaoLing140/StellarInsure/issues/146)

## [1.21.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.21.0...v1.21.1) (2026-04-29)


### Bug Fixes

* standardize error handling, add icon aria-hidden, document contract state vars ([1dd3967](https://github.com/ChaoLing140/StellarInsure/commit/1dd39678b9396758b665ba4952754b09d8910ac1)), closes [#277](https://github.com/ChaoLing140/StellarInsure/issues/277) [#276](https://github.com/ChaoLing140/StellarInsure/issues/276) [#279](https://github.com/ChaoLing140/StellarInsure/issues/279) [#276](https://github.com/ChaoLing140/StellarInsure/issues/276) [#277](https://github.com/ChaoLing140/StellarInsure/issues/277) [#279](https://github.com/ChaoLing140/StellarInsure/issues/279)

# [1.21.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.20.0...v1.21.0) (2026-04-29)


### Features

* fix issues [#285](https://github.com/ChaoLing140/StellarInsure/issues/285) and [#283](https://github.com/ChaoLing140/StellarInsure/issues/283) ([4ecde49](https://github.com/ChaoLing140/StellarInsure/commit/4ecde499a25d4a15ff787b94834bdb6a586cc6ed))
* implement issue [#207](https://github.com/ChaoLing140/StellarInsure/issues/207) - API client integration ([2032b2c](https://github.com/ChaoLing140/StellarInsure/commit/2032b2c22fe0e6340360074869d91fab5b4f39a0))

# [1.20.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.19.0...v1.20.0) (2026-04-29)


### Features

* added network swticher ([ec3a2a8](https://github.com/ChaoLing140/StellarInsure/commit/ec3a2a802fc503d5d2827893d26c3b8fe835d19e))
* added partial claim support to contracts ([761ab03](https://github.com/ChaoLing140/StellarInsure/commit/761ab03cd8ef2f313eeec9dc1bfe5387f763ecb7))

# [1.19.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.18.1...v1.19.0) (2026-04-29)


### Features

* implement dark mode with theme toggle and system preference support ([4b8f35f](https://github.com/ChaoLing140/StellarInsure/commit/4b8f35f72c6a777276f3c262e1e9d8db91b9e2c8))

## [1.18.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.18.0...v1.18.1) (2026-04-29)


### Bug Fixes

* replace console.log with proper logging mechanism ([761346c](https://github.com/ChaoLing140/StellarInsure/commit/761346c23109b0f76562167ef59354582937ade8)), closes [#282](https://github.com/ChaoLing140/StellarInsure/issues/282)

# [1.18.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.17.0...v1.18.0) (2026-04-29)


### Features

* Update Next.js, fix CSS variables, add oracle integration ([0736d07](https://github.com/ChaoLing140/StellarInsure/commit/0736d07694c5e06bd16ac4518366ded486f76e15)), closes [#275](https://github.com/ChaoLing140/StellarInsure/issues/275) [#280](https://github.com/ChaoLing140/StellarInsure/issues/280) [#198](https://github.com/ChaoLing140/StellarInsure/issues/198)

# [1.17.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.16.0...v1.17.0) (2026-04-27)


### Features

* implement [#189](https://github.com/ChaoLing140/StellarInsure/issues/189) transactions endpoint, [#187](https://github.com/ChaoLing140/StellarInsure/issues/187) stellar signature verification, [#196](https://github.com/ChaoLing140/StellarInsure/issues/196) multiple claims support, [#188](https://github.com/ChaoLing140/StellarInsure/issues/188) JWT blacklisting ([61fcdd5](https://github.com/ChaoLing140/StellarInsure/commit/61fcdd5a4cbf37a4dbb15d358c0a25f7b9abd41a))

# [1.16.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.15.0...v1.16.0) (2026-04-26)


### Features

* **frontend:** add reusable route seo metadata ([e3bdfc4](https://github.com/ChaoLing140/StellarInsure/commit/e3bdfc4a11b7543764a8a3d1107cc9d4e37b8361))

# [1.15.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.14.0...v1.15.0) (2026-04-26)


### Features

* resolve multiple backend and contract issues ([80d6697](https://github.com/ChaoLing140/StellarInsure/commit/80d66978af56fce714dc1226aad6f689e6cdc7a2)), closes [#190](https://github.com/ChaoLing140/StellarInsure/issues/190) [#186](https://github.com/ChaoLing140/StellarInsure/issues/186) [#192](https://github.com/ChaoLing140/StellarInsure/issues/192) [#195](https://github.com/ChaoLing140/StellarInsure/issues/195) [#190](https://github.com/ChaoLing140/StellarInsure/issues/190) [#186](https://github.com/ChaoLing140/StellarInsure/issues/186) [#192](https://github.com/ChaoLing140/StellarInsure/issues/192) [#195](https://github.com/ChaoLing140/StellarInsure/issues/195)

# [1.14.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.13.0...v1.14.0) (2026-04-26)


### Bug Fixes

* **ci:** add backend deployment pipeline with migrations and rollback ([2a250ba](https://github.com/ChaoLing140/StellarInsure/commit/2a250ba523df1335da8784c74fb6b3bbc165c3ce))
* **ci:** add Trivy security scanning workflow ([0c7272e](https://github.com/ChaoLing140/StellarInsure/commit/0c7272eec002e635e14f1fcc98e88f8ed306efd7)), closes [ChaoLing140/StellarInsure#218](https://github.com/ChaoLing140/StellarInsure/issues/218)


### Features

* **frontend:** add keyboard shortcuts help modal ([86386ef](https://github.com/ChaoLing140/StellarInsure/commit/86386efcdbf969a05cd75cd6c15e90acb4d58a20)), closes [ChaoLing140/StellarInsure#111](https://github.com/ChaoLing140/StellarInsure/issues/111)

# [1.13.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.12.0...v1.13.0) (2026-04-26)


### Features

* **#124:** Add retry UI for failed transactions ([2b87699](https://github.com/ChaoLing140/StellarInsure/commit/2b87699890ffc0be702a71873ef1c0cc79fdc88d)), closes [#124](https://github.com/ChaoLing140/StellarInsure/issues/124)

# [1.12.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.11.0...v1.12.0) (2026-04-26)


### Features

* **frontend:** add reusable modal, drawer, pagination, file validation, and policy selector components ([74dc5d8](https://github.com/ChaoLing140/StellarInsure/commit/74dc5d858738ceae4468b05456a4aab1d74b9930)), closes [#113](https://github.com/ChaoLing140/StellarInsure/issues/113) [#115](https://github.com/ChaoLing140/StellarInsure/issues/115) [#118](https://github.com/ChaoLing140/StellarInsure/issues/118) [#112](https://github.com/ChaoLing140/StellarInsure/issues/112)

# [1.11.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.10.0...v1.11.0) (2026-04-26)


### Features

* implement frontend issues [#119](https://github.com/ChaoLing140/StellarInsure/issues/119), [#117](https://github.com/ChaoLing140/StellarInsure/issues/117), [#120](https://github.com/ChaoLing140/StellarInsure/issues/120), [#116](https://github.com/ChaoLing140/StellarInsure/issues/116) ([eaf53cb](https://github.com/ChaoLing140/StellarInsure/commit/eaf53cba795d8234dec61d473be9b23d9e8a7a96))

# [1.10.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.9.1...v1.10.0) (2026-04-25)


### Features

* API error boundaries, offline banner, unsaved guard, reduced-motion ([#125](https://github.com/ChaoLing140/StellarInsure/issues/125) [#126](https://github.com/ChaoLing140/StellarInsure/issues/126) [#122](https://github.com/ChaoLing140/StellarInsure/issues/122) [#139](https://github.com/ChaoLing140/StellarInsure/issues/139)) ([d5d1ad2](https://github.com/ChaoLing140/StellarInsure/commit/d5d1ad29f6ca84efebb552fec8fd74153a0bf7bf))

## [1.9.1](https://github.com/ChaoLing140/StellarInsure/compare/v1.9.0...v1.9.1) (2026-04-25)


### Bug Fixes

* **frontend:** improve skip-link focus handling ([#144](https://github.com/ChaoLing140/StellarInsure/issues/144)) ([47ac771](https://github.com/ChaoLing140/StellarInsure/commit/47ac771b0a2064cdae55dedffc12f9287a28e4c5))

# [1.9.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.8.0...v1.9.0) (2026-04-25)


### Features

* implement issues [#21](https://github.com/ChaoLing140/StellarInsure/issues/21), [#30](https://github.com/ChaoLing140/StellarInsure/issues/30), [#32](https://github.com/ChaoLing140/StellarInsure/issues/32), [#47](https://github.com/ChaoLing140/StellarInsure/issues/47) ([9bf8602](https://github.com/ChaoLing140/StellarInsure/commit/9bf860204d296fc259d2d4a0b4889626972df105))

# [1.8.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.7.0...v1.8.0) (2026-04-25)


### Features

* implement frontend issues [#91](https://github.com/ChaoLing140/StellarInsure/issues/91), [#95](https://github.com/ChaoLing140/StellarInsure/issues/95), [#121](https://github.com/ChaoLing140/StellarInsure/issues/121), [#123](https://github.com/ChaoLing140/StellarInsure/issues/123) ([499a80a](https://github.com/ChaoLing140/StellarInsure/commit/499a80ae4f651d9d29567d762fe1443de24795c1))

# [1.7.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.6.0...v1.7.0) (2026-04-25)


### Features

* scaffold accessible tooltip component with hover/focus/blur handlers ([52bc8d4](https://github.com/ChaoLing140/StellarInsure/commit/52bc8d42f6b595c636b7adc4c272d58aa47c2f05))

# [1.6.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.5.0...v1.6.0) (2026-04-24)


### Bug Fixes

* resolve lint errors and add missing icon definitions ([ea7df54](https://github.com/ChaoLing140/StellarInsure/commit/ea7df54fb2ac82cdd9f159cd84288f5c7600dd65))


### Features

* implement status pills, sortable policy table, onboarding checklist, and withdrawal flow ([4629294](https://github.com/ChaoLing140/StellarInsure/commit/4629294d89f632b421bc50ae2d3a78f09f39473c))

# [1.5.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.4.0...v1.5.0) (2026-04-24)


### Features

* **frontend:** add claim eligibility pre-check UI ([f94f20c](https://github.com/ChaoLing140/StellarInsure/commit/f94f20c2d5b3e1415ed1f5456dfd93766ad63b69)), closes [#93](https://github.com/ChaoLing140/StellarInsure/issues/93)
* **frontend:** expand settings page with account, preferences, and security sections ([2f23a39](https://github.com/ChaoLing140/StellarInsure/commit/2f23a39fd39c4b5de3a7bd2d9acb2474bf0894e4)), closes [#99](https://github.com/ChaoLing140/StellarInsure/issues/99)
* **frontend:** implement notifications center panel component ([8443dd6](https://github.com/ChaoLing140/StellarInsure/commit/8443dd62f4738e7028f4c6eebff3b6eacbcb63ed)), closes [#97](https://github.com/ChaoLing140/StellarInsure/issues/97)

# [1.4.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.3.0...v1.4.0) (2026-04-24)


### Features

* **analytics:** integrate date range picker with preset shortcuts into dashboard ([5d2aa04](https://github.com/ChaoLing140/StellarInsure/commit/5d2aa04bc4cd9e5c56045680976ec1047540b083))
* **claims:** add payout breakdown component with line items and status badge ([53b285b](https://github.com/ChaoLing140/StellarInsure/commit/53b285b6a656a3f5d7c4df53cdb1ace957226163))
* **claims:** implement claim submission form with evidence inputs and preview ([6743314](https://github.com/ChaoLing140/StellarInsure/commit/674331467d53d0ce54a96c4151e3bcd571dc4169))
* **pools:** add risk pool deposit flow with multi-step UI and utilization display ([6ee8b55](https://github.com/ChaoLing140/StellarInsure/commit/6ee8b55b49e7e65648699b977d72ae8071d94b30))

# [1.3.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.2.0...v1.3.0) (2026-04-24)


### Features

* add global rate limiting to gateway ([0995c90](https://github.com/ChaoLing140/StellarInsure/commit/0995c90cf2b353698d9e411a8dd01c2f4270c772))

# [1.2.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.1.0...v1.2.0) (2026-04-24)


### Features

* policy list filter ([654ec50](https://github.com/ChaoLing140/StellarInsure/commit/654ec50663dff595c541d8503924bd53b52ed54a))

# [1.1.0](https://github.com/ChaoLing140/StellarInsure/compare/v1.0.0...v1.1.0) (2026-04-24)


### Features

* add k8s manifests and staging deployment workflow ([31ef8ef](https://github.com/ChaoLing140/StellarInsure/commit/31ef8eff8456644def03f68d3f542e035a9c57bd))

# 1.0.0 (2026-04-24)


### Bug Fixes

* [#208](https://github.com/ChaoLing140/StellarInsure/issues/208) [#211](https://github.com/ChaoLing140/StellarInsure/issues/211) [#212](https://github.com/ChaoLing140/StellarInsure/issues/212) [#215](https://github.com/ChaoLing140/StellarInsure/issues/215) resolve frontend & docker issues ([29a6d2a](https://github.com/ChaoLing140/StellarInsure/commit/29a6d2ac37f8c2e32169914185bdd0684615cb59))
* restrict CORS to specific origins for security ([440eb67](https://github.com/ChaoLing140/StellarInsure/commit/440eb673db36fcaf499f1092990a94565d6f90da))


### Features

* add claim flow polish, CODEOWNERS, release workflow, and component tests ([96180ec](https://github.com/ChaoLing140/StellarInsure/commit/96180ecdd825950c9089a3ec2b94f080a4769fee)), closes [#205](https://github.com/ChaoLing140/StellarInsure/issues/205) [#216](https://github.com/ChaoLing140/StellarInsure/issues/216) [#217](https://github.com/ChaoLing140/StellarInsure/issues/217) [#222](https://github.com/ChaoLing140/StellarInsure/issues/222) [#205](https://github.com/ChaoLing140/StellarInsure/issues/205) [#216](https://github.com/ChaoLing140/StellarInsure/issues/216) [#217](https://github.com/ChaoLing140/StellarInsure/issues/217) [#222](https://github.com/ChaoLing140/StellarInsure/issues/222)
* add comprehensive input validation with Pydantic ([bfc8e99](https://github.com/ChaoLing140/StellarInsure/commit/bfc8e995758742d251bca0ac639409d377eef358))
* add contract events risk pool and test coverage ([e78c957](https://github.com/ChaoLing140/StellarInsure/commit/e78c9573ee27a77059c978bf870212aa323ef455))
* add formatted coverage amount inputs for [#73](https://github.com/ChaoLing140/StellarInsure/issues/73) ([c356b70](https://github.com/ChaoLing140/StellarInsure/commit/c356b701cf14dd6fc741f4a650f5bbcddfaf952d))
* add frontend quality improvements and ci workflows ([c00876b](https://github.com/ChaoLing140/StellarInsure/commit/c00876b9a8a81d798751916d33d560c0c3170cef))
* add PostgreSQL connection pooling configuration ([4a7ccfa](https://github.com/ChaoLing140/StellarInsure/commit/4a7ccfaa88117e6deb592b425b4229ea1a744b6d))
* addede the fixes ([313064e](https://github.com/ChaoLing140/StellarInsure/commit/313064e9588ed8b8004baca80aca5c6f2efdc778))
* **backend:** add environment config, rate limiting, Redis caching, and webhook notifications ([6d6a2bc](https://github.com/ChaoLing140/StellarInsure/commit/6d6a2bca402d17b7a0618540d12ce6939e1872e0)), closes [#48](https://github.com/ChaoLing140/StellarInsure/issues/48) [#11](https://github.com/ChaoLing140/StellarInsure/issues/11) [#9](https://github.com/ChaoLing140/StellarInsure/issues/9) [#49](https://github.com/ChaoLing140/StellarInsure/issues/49)
* build policy summary review step for [#78](https://github.com/ChaoLing140/StellarInsure/issues/78) ([92564cf](https://github.com/ChaoLing140/StellarInsure/commit/92564cfbb56ae56fa360825375e80a7a3fc9d3f3))
* **contracts:** implement claim payout verification and treasury tracking ([#20](https://github.com/ChaoLing140/StellarInsure/issues/20)) ([dc4ad59](https://github.com/ChaoLing140/StellarInsure/commit/dc4ad5945d615b4820a94bf234fe80f9bbbaecda))
* **contracts:** implement policy expiration checking ([#18](https://github.com/ChaoLing140/StellarInsure/issues/18)) ([4e22353](https://github.com/ChaoLing140/StellarInsure/commit/4e22353f2013214c222ea230a6237b3635745332))
* **frontend:** add pending transaction timeline ([680a735](https://github.com/ChaoLing140/StellarInsure/commit/680a73500a2465d214643eb9f731384082405e73)), closes [#81](https://github.com/ChaoLing140/StellarInsure/issues/81)
* **frontend:** build policy creation page shell with stepper layout ([c2b2ad0](https://github.com/ChaoLing140/StellarInsure/commit/c2b2ad0ba738969ebd4a561a15ceb2b1ff18596d)), closes [#71](https://github.com/ChaoLing140/StellarInsure/issues/71)
* **frontend:** create transaction confirmation modal ([cbe204b](https://github.com/ChaoLing140/StellarInsure/commit/cbe204bb2dd10f4460dae3fbf97f5b24c452fd32)), closes [#80](https://github.com/ChaoLing140/StellarInsure/issues/80)
* **frontend:** create trigger-builder, premium-estimate, and validation-summary components ([#76](https://github.com/ChaoLing140/StellarInsure/issues/76), [#74](https://github.com/ChaoLing140/StellarInsure/issues/74), [#84](https://github.com/ChaoLing140/StellarInsure/issues/84)) ([89980ed](https://github.com/ChaoLing140/StellarInsure/commit/89980edd4dcf51e2c92a8888af0c61b10b51b76f))
* **frontend:** implement loading skeleton library ([4c6f387](https://github.com/ChaoLing140/StellarInsure/commit/4c6f3872d64f915118b08340b2ce6fb0da13eb2b)), closes [#85](https://github.com/ChaoLing140/StellarInsure/issues/85)
* **frontend:** implement policy draft autosave ([935ed13](https://github.com/ChaoLing140/StellarInsure/commit/935ed13f55e1238f51f4aae9a43caaa28c268e7b)), closes [#79](https://github.com/ChaoLing140/StellarInsure/issues/79)
* **frontend:** implement policy type selector cards ([ade8f80](https://github.com/ChaoLing140/StellarInsure/commit/ade8f80903f05afbccc79b3bd09ed44b2b49f0c1)), closes [#72](https://github.com/ChaoLing140/StellarInsure/issues/72)
* **frontend:** implement responsive mobile bottom navigation ([#131](https://github.com/ChaoLing140/StellarInsure/issues/131)) ([b7da18a](https://github.com/ChaoLing140/StellarInsure/commit/b7da18a0844d120c92ba268175b2188c80b283cf))
* **frontend:** improve policy detail usability ([06b9e74](https://github.com/ChaoLing140/StellarInsure/commit/06b9e74830ddc90b056bae456f1c09c757437cc3))
* **frontend:** integrate condition builder, premium estimate, and validation summary ([#76](https://github.com/ChaoLing140/StellarInsure/issues/76), [#74](https://github.com/ChaoLing140/StellarInsure/issues/74), [#84](https://github.com/ChaoLing140/StellarInsure/issues/84)) ([c1b14e3](https://github.com/ChaoLing140/StellarInsure/commit/c1b14e3857333365318a259bc7f9bab9d9dddcd1))
* implement claim endpoints with file upload support ([f52f40d](https://github.com/ChaoLing140/StellarInsure/commit/f52f40d47cfe33a93f5d53cc04c7e56e78eda776))
* implement claim endpoints with file upload support ([8438a05](https://github.com/ChaoLing140/StellarInsure/commit/8438a05004f3453befd78be51d4d00dda6a7795e))
* implement database models with SQLAlchemy ([06814fa](https://github.com/ChaoLing140/StellarInsure/commit/06814fa2efbb8d66955e81fb0cc06392787b22d4))
* implement JWT authentication system ([2df9dd2](https://github.com/ChaoLing140/StellarInsure/commit/2df9dd271dbcb526b832fcf733d5f9d7c1c7e47d))
* implement policy endpoints with pagination and filtering ([e868b1c](https://github.com/ChaoLing140/StellarInsure/commit/e868b1c6e7a306f398d0c962908c0c956aa57c0c))
* implement Stellar smart contract integration ([bd66b5a](https://github.com/ChaoLing140/StellarInsure/commit/bd66b5a1d56e63a56cd83a9d78c9c4c02b6f0d0e))
* implement token transfers and backend testing factories ([a30df2d](https://github.com/ChaoLing140/StellarInsure/commit/a30df2d8c529f47b5ae2950c5bc0a61af3ee6acb))
* implement transaction history, onboarding flow, backend logging, and contract upgradeability ([8800f2f](https://github.com/ChaoLing140/StellarInsure/commit/8800f2f0e78ba072ff793b30b7bafaf485c79ff1))
* initial commit - StellarInsure parametric insurance protocol ([9a883eb](https://github.com/ChaoLing140/StellarInsure/commit/9a883ebda635bb61c3cd41d78c26eeecf0e3e5e3))
* multi-sig admin ([#16](https://github.com/ChaoLing140/StellarInsure/issues/16)), policy renewal ([#22](https://github.com/ChaoLing140/StellarInsure/issues/22)), integration tests ([#29](https://github.com/ChaoLing140/StellarInsure/issues/29)), emergency pause ([#51](https://github.com/ChaoLing140/StellarInsure/issues/51)) ([48c88f0](https://github.com/ChaoLing140/StellarInsure/commit/48c88f0b8821297da48ef0da16c9aea5eb669e90))
* premium calculation, mutation testing, and legal pages ([c7f4d1f](https://github.com/ChaoLing140/StellarInsure/commit/c7f4d1f4637e1ddbdad9676906902f89f59a158e)), closes [#17](https://github.com/ChaoLing140/StellarInsure/issues/17) [#52](https://github.com/ChaoLing140/StellarInsure/issues/52) [#128](https://github.com/ChaoLing140/StellarInsure/issues/128)
* resolve issue templates, layout navigation, and fuzz coverage ([704bfbe](https://github.com/ChaoLing140/StellarInsure/commit/704bfbe3870619f081b0681b7336e4a09d3d6615))
