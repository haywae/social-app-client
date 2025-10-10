# Diff Details

Date : 2025-09-18 13:17:31

Directory /home/haywae/projects/wxc/wxc-client

Total : 179 files,  5603 codes, 675 comments, 823 blanks, all 7101 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [package-lock.json](/package-lock.json) | JSON | 234 | 0 | 0 | 234 |
| [package.json](/package.json) | JSON | 2 | 0 | 0 | 2 |
| [src/App.tsx](/src/App.tsx) | TypeScript JSX | 1 | 0 | 5 | 6 |
| [src/appConfig.ts](/src/appConfig.ts) | TypeScript | 4 | 0 | 3 | 7 |
| [src/assets/countries.ts](/src/assets/countries.ts) | TypeScript | 21 | 6 | 6 | 33 |
| [src/assets/currencies.ts](/src/assets/currencies.ts) | TypeScript | 183 | 0 | 3 | 186 |
| [src/assets/default-avatar.svg](/src/assets/default-avatar.svg) | XML | 3 | 0 | 0 | 3 |
| [src/assets/icons.tsx](/src/assets/icons.tsx) | TypeScript JSX | 43 | 25 | 0 | 68 |
| [src/assets/text.ts](/src/assets/text.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/components/comments/comment.css](/src/components/comments/comment.css) | PostCSS | 0 | 0 | 1 | 1 |
| [src/components/comments/comment.tsx](/src/components/comments/comment.tsx) | TypeScript JSX | 91 | 4 | 15 | 110 |
| [src/components/comments/commentOptionsMenu.tsx](/src/components/comments/commentOptionsMenu.tsx) | TypeScript JSX | 98 | 3 | 9 | 110 |
| [src/components/common/cDropdown.css](/src/components/common/cDropdown.css) | PostCSS | 60 | 0 | 8 | 68 |
| [src/components/common/countryDropdown.tsx](/src/components/common/countryDropdown.tsx) | TypeScript JSX | 67 | 12 | 10 | 89 |
| [src/components/common/globalLoading.tsx](/src/components/common/globalLoading.tsx) | TypeScript JSX | 1 | -1 | 0 | 0 |
| [src/components/common/modal.css](/src/components/common/modal.css) | PostCSS | 40 | 0 | 5 | 45 |
| [src/components/common/modal.tsx](/src/components/common/modal.tsx) | TypeScript JSX | 35 | 1 | 4 | 40 |
| [src/components/common/withAuth.tsx](/src/components/common/withAuth.tsx) | TypeScript JSX | 4 | 1 | -1 | 4 |
| [src/components/exchange/converter.tsx](/src/components/exchange/converter.tsx) | TypeScript JSX | 111 | 25 | 8 | 144 |
| [src/components/exchange/currencyDropdown.tsx](/src/components/exchange/currencyDropdown.tsx) | TypeScript JSX | 68 | 25 | 8 | 101 |
| [src/components/exchange/currencyInput.tsx](/src/components/exchange/currencyInput.tsx) | TypeScript JSX | 57 | 34 | 8 | 99 |
| [src/components/exchange/editExchangeModal.tsx](/src/components/exchange/editExchangeModal.tsx) | TypeScript JSX | 63 | 1 | 7 | 71 |
| [src/components/exchange/ratesCardSkeleton.css](/src/components/exchange/ratesCardSkeleton.css) | PostCSS | 30 | 6 | 8 | 44 |
| [src/components/exchange/ratesCardSkeleton.tsx](/src/components/exchange/ratesCardSkeleton.tsx) | TypeScript JSX | 23 | 3 | 3 | 29 |
| [src/components/exchange/ratesTable.tsx](/src/components/exchange/ratesTable.tsx) | TypeScript JSX | 67 | 16 | 3 | 86 |
| [src/components/layout/header.css](/src/components/layout/header.css) | PostCSS | -88 | -6 | -13 | -107 |
| [src/components/layout/header.tsx](/src/components/layout/header.tsx) | TypeScript JSX | -57 | -5 | -8 | -70 |
| [src/components/layout/leftSideBar.css](/src/components/layout/leftSideBar.css) | PostCSS | -4 | 0 | 0 | -4 |
| [src/components/layout/leftSideBar.tsx](/src/components/layout/leftSideBar.tsx) | TypeScript JSX | -1 | 0 | 1 | 0 |
| [src/components/layout/mobileHeader.css](/src/components/layout/mobileHeader.css) | PostCSS | 92 | 9 | 16 | 117 |
| [src/components/layout/mobileHeader.tsx](/src/components/layout/mobileHeader.tsx) | TypeScript JSX | 62 | 8 | 11 | 81 |
| [src/components/layout/pageHeader.css](/src/components/layout/pageHeader.css) | PostCSS | 48 | 2 | 6 | 56 |
| [src/components/layout/pageHeader.tsx](/src/components/layout/pageHeader.tsx) | TypeScript JSX | 22 | 0 | 4 | 26 |
| [src/components/notifications/notificationItem.css](/src/components/notifications/notificationItem.css) | PostCSS | -2 | 0 | -1 | -3 |
| [src/components/notifications/notificationItem.tsx](/src/components/notifications/notificationItem.tsx) | TypeScript JSX | 8 | -1 | -2 | 5 |
| [src/components/posts/createPostModal.css](/src/components/posts/createPostModal.css) | PostCSS | -106 | -10 | -13 | -129 |
| [src/components/posts/createPostModal.tsx](/src/components/posts/createPostModal.tsx) | TypeScript JSX | -63 | -3 | -9 | -75 |
| [src/components/posts/post.css](/src/components/posts/post.css) | PostCSS | -12 | 5 | -2 | -9 |
| [src/components/posts/post.tsx](/src/components/posts/post.tsx) | TypeScript JSX | 4 | 6 | 9 | 19 |
| [src/components/posts/postFeed.css](/src/components/posts/postFeed.css) | PostCSS | 23 | 1 | 5 | 29 |
| [src/components/posts/postFeed.tsx](/src/components/posts/postFeed.tsx) | TypeScript JSX | 8 | -1 | -1 | 6 |
| [src/components/posts/postOptionsMenu.css](/src/components/posts/postOptionsMenu.css) | PostCSS | -1 | 0 | 0 | -1 |
| [src/components/posts/postOptionsMenu.tsx](/src/components/posts/postOptionsMenu.tsx) | TypeScript JSX | 13 | 5 | 1 | 19 |
| [src/components/search/postResult.css](/src/components/search/postResult.css) | PostCSS | 0 | 0 | 1 | 1 |
| [src/components/search/postResult.tsx](/src/components/search/postResult.tsx) | TypeScript JSX | 22 | 3 | 6 | 31 |
| [src/components/search/searchOverlay.css](/src/components/search/searchOverlay.css) | PostCSS | 11 | 2 | 2 | 15 |
| [src/components/search/searchOverlay.tsx](/src/components/search/searchOverlay.tsx) | TypeScript JSX | 19 | 6 | 5 | 30 |
| [src/components/search/searchResultContent.tsx](/src/components/search/searchResultContent.tsx) | TypeScript JSX | 41 | 7 | 6 | 54 |
| [src/components/search/tabbedResultComponent.tsx](/src/components/search/tabbedResultComponent.tsx) | TypeScript JSX | 38 | 3 | 5 | 46 |
| [src/components/search/userResult.css](/src/components/search/userResult.css) | PostCSS | 72 | 3 | 12 | 87 |
| [src/components/search/userResult.tsx](/src/components/search/userResult.tsx) | TypeScript JSX | 51 | 1 | 8 | 60 |
| [src/components/settings/accountSettings.tsx](/src/components/settings/accountSettings.tsx) | TypeScript JSX | -49 | 0 | -6 | -55 |
| [src/components/settings/changeEmailForm.tsx](/src/components/settings/changeEmailForm.tsx) | TypeScript JSX | 47 | 0 | 5 | 52 |
| [src/components/settings/changePasswordForm.tsx](/src/components/settings/changePasswordForm.tsx) | TypeScript JSX | 57 | 0 | 7 | 64 |
| [src/components/settings/changeUsernameForm.tsx](/src/components/settings/changeUsernameForm.tsx) | TypeScript JSX | 47 | 0 | 4 | 51 |
| [src/components/settings/deleteAccountModal.css](/src/components/settings/deleteAccountModal.css) | PostCSS | 45 | 1 | 5 | 51 |
| [src/components/settings/deleteAccountModal.tsx](/src/components/settings/deleteAccountModal.tsx) | TypeScript JSX | 58 | 2 | 6 | 66 |
| [src/components/settings/profileSettings.tsx](/src/components/settings/profileSettings.tsx) | TypeScript JSX | -53 | 0 | -6 | -59 |
| [src/components/userProfile/liveRatesTab.css](/src/components/userProfile/liveRatesTab.css) | PostCSS | 103 | 10 | 20 | 133 |
| [src/components/userProfile/liveRatesTab.tsx](/src/components/userProfile/liveRatesTab.tsx) | TypeScript JSX | 42 | 3 | 4 | 49 |
| [src/configs/appConfig.ts](/src/configs/appConfig.ts) | TypeScript | -1 | 0 | 0 | -1 |
| [src/configs/authTypes.ts](/src/configs/authTypes.ts) | TypeScript | -9 | -1 | -1 | -11 |
| [src/configs/notificationsTypes.ts](/src/configs/notificationsTypes.ts) | TypeScript | -19 | -2 | -1 | -22 |
| [src/configs/postsTypes.ts](/src/configs/postsTypes.ts) | TypeScript | -19 | -6 | -2 | -27 |
| [src/configs/settingsTypes.ts](/src/configs/settingsTypes.ts) | TypeScript | -7 | 0 | 0 | -7 |
| [src/configs/userTypes.ts](/src/configs/userTypes.ts) | TypeScript | -18 | -1 | -4 | -23 |
| [src/data/countries.ts](/src/data/countries.ts) | TypeScript | -13 | -1 | 0 | -14 |
| [src/main.tsx](/src/main.tsx) | TypeScript JSX | 32 | 1 | 1 | 34 |
| [src/pages/accountManagementPage.tsx](/src/pages/accountManagementPage.tsx) | TypeScript JSX | 24 | 0 | 3 | 27 |
| [src/pages/authPages/login.tsx](/src/pages/authPages/login.tsx) | TypeScript JSX | 1 | -1 | 0 | 0 |
| [src/pages/authPages/register.tsx](/src/pages/authPages/register.tsx) | TypeScript JSX | -1 | 4 | 4 | 7 |
| [src/pages/createPostPage.tsx](/src/pages/createPostPage.tsx) | TypeScript JSX | 67 | 27 | 11 | 105 |
| [src/pages/dashboard.tsx](/src/pages/dashboard.tsx) | TypeScript JSX | -20 | 0 | -5 | -25 |
| [src/pages/errorPage.tsx](/src/pages/errorPage.tsx) | TypeScript JSX | 23 | 1 | 4 | 28 |
| [src/pages/exchangePage.tsx](/src/pages/exchangePage.tsx) | TypeScript JSX | 177 | 37 | 35 | 249 |
| [src/pages/home.tsx](/src/pages/home.tsx) | TypeScript JSX | 25 | 2 | 5 | 32 |
| [src/pages/notificationsPage.tsx](/src/pages/notificationsPage.tsx) | TypeScript JSX | 12 | -1 | 2 | 13 |
| [src/pages/postDetailPage.tsx](/src/pages/postDetailPage.tsx) | TypeScript JSX | 99 | 2 | 15 | 116 |
| [src/pages/profileSettingsPage.tsx](/src/pages/profileSettingsPage.tsx) | TypeScript JSX | 128 | 6 | 18 | 152 |
| [src/pages/searchPage.tsx](/src/pages/searchPage.tsx) | TypeScript JSX | 70 | 9 | 11 | 90 |
| [src/pages/securityPrivacyPage.tsx](/src/pages/securityPrivacyPage.tsx) | TypeScript JSX | 34 | 0 | 3 | 37 |
| [src/pages/settingsPage.tsx](/src/pages/settingsPage.tsx) | TypeScript JSX | 11 | 12 | 1 | 24 |
| [src/pages/singlePostPage.tsx](/src/pages/singlePostPage.tsx) | TypeScript JSX | -42 | -4 | -11 | -57 |
| [src/pages/userProfilePage.tsx](/src/pages/userProfilePage.tsx) | TypeScript JSX | 76 | 4 | 9 | 89 |
| [src/slices/auth/authSlice.ts](/src/slices/auth/authSlice.ts) | TypeScript | 77 | 0 | 6 | 83 |
| [src/slices/comments/commentsSlice.ts](/src/slices/comments/commentsSlice.ts) | TypeScript | 91 | 1 | 5 | 97 |
| [src/slices/exchange/exchangeSlice.ts](/src/slices/exchange/exchangeSlice.ts) | TypeScript | 194 | 61 | 19 | 274 |
| [src/slices/exchange/localStorageMiddleware.ts](/src/slices/exchange/localStorageMiddleware.ts) | TypeScript | 24 | 14 | 4 | 42 |
| [src/slices/notification/notificationSlice.ts](/src/slices/notification/notificationSlice.ts) | TypeScript | 24 | 0 | 0 | 24 |
| [src/slices/posts/postsSlice.ts](/src/slices/posts/postsSlice.ts) | TypeScript | 53 | 5 | 3 | 61 |
| [src/slices/search/searchSlice.ts](/src/slices/search/searchSlice.ts) | TypeScript | 124 | 15 | 8 | 147 |
| [src/slices/settings/settingsSlice.ts](/src/slices/settings/settingsSlice.ts) | TypeScript | 17 | 1 | 2 | 20 |
| [src/slices/user/resgitrationSlice.ts](/src/slices/user/resgitrationSlice.ts) | TypeScript | 0 | -1 | 0 | -1 |
| [src/slices/user/userProfileSlice.ts](/src/slices/user/userProfileSlice.ts) | TypeScript | 27 | 3 | 0 | 30 |
| [src/store.ts](/src/store.ts) | TypeScript | 8 | 0 | 1 | 9 |
| [src/styles/App.css](/src/styles/App.css) | PostCSS | 6 | 0 | 1 | 7 |
| [src/styles/accountManagementPage.css](/src/styles/accountManagementPage.css) | PostCSS | 39 | 2 | 6 | 47 |
| [src/styles/auth-container.css](/src/styles/auth-container.css) | PostCSS | -34 | 0 | -5 | -39 |
| [src/styles/createPostPage.css](/src/styles/createPostPage.css) | PostCSS | 99 | 4 | 21 | 124 |
| [src/styles/errorPage.css](/src/styles/errorPage.css) | PostCSS | 21 | 0 | 2 | 23 |
| [src/styles/exchangePage.css](/src/styles/exchangePage.css) | PostCSS | 240 | 6 | 38 | 284 |
| [src/styles/icons.css](/src/styles/icons.css) | PostCSS | 17 | 1 | 3 | 21 |
| [src/styles/index.css](/src/styles/index.css) | PostCSS | 9 | 3 | 2 | 14 |
| [src/styles/notificationsPage.css](/src/styles/notificationsPage.css) | PostCSS | -8 | 0 | -3 | -11 |
| [src/styles/postDetailPage.css](/src/styles/postDetailPage.css) | PostCSS | 123 | 12 | 17 | 152 |
| [src/styles/profileSettingsPage.css](/src/styles/profileSettingsPage.css) | PostCSS | 42 | 4 | 7 | 53 |
| [src/styles/searchPage.css](/src/styles/searchPage.css) | PostCSS | 317 | 15 | 53 | 385 |
| [src/styles/settingsPage.css](/src/styles/settingsPage.css) | PostCSS | -23 | -1 | -5 | -29 |
| [src/styles/singlePostPage.css](/src/styles/singlePostPage.css) | PostCSS | -46 | -11 | -12 | -69 |
| [src/styles/userProfilePage.css](/src/styles/userProfilePage.css) | PostCSS | -57 | 4 | -9 | -62 |
| [src/tests/assets/icons.test.tsx](/src/tests/assets/icons.test.tsx) | TypeScript JSX | 42 | 6 | 9 | 57 |
| [src/tests/components/component.test.tsx](/src/tests/components/component.test.tsx) | TypeScript JSX | -78 | -14 | -19 | -111 |
| [src/tests/components/converter.test.tsx](/src/tests/components/converter.test.tsx) | TypeScript JSX | 134 | 13 | 36 | 183 |
| [src/tests/components/countryDropdown.test.tsx](/src/tests/components/countryDropdown.test.tsx) | TypeScript JSX | 78 | 26 | 32 | 136 |
| [src/tests/components/currencyDropdown.test.tsx](/src/tests/components/currencyDropdown.test.tsx) | TypeScript JSX | 109 | 11 | 22 | 142 |
| [src/tests/components/currencyInput.test.tsx](/src/tests/components/currencyInput.test.tsx) | TypeScript JSX | 81 | 8 | 16 | 105 |
| [src/tests/components/withAuth.test.tsx](/src/tests/components/withAuth.test.tsx) | TypeScript JSX | 60 | 11 | 16 | 87 |
| [src/tests/icons.test.tsx](/src/tests/icons.test.tsx) | TypeScript JSX | -43 | -6 | -10 | -59 |
| [src/tests/mocks/server.ts](/src/tests/mocks/server.ts) | TypeScript | -21 | -5 | -5 | -31 |
| [src/tests/pages/auth/forgotPassword.test.tsx](/src/tests/pages/auth/forgotPassword.test.tsx) | TypeScript JSX | 110 | 13 | 30 | 153 |
| [src/tests/pages/auth/login.test.tsx](/src/tests/pages/auth/login.test.tsx) | TypeScript JSX | 138 | 6 | 32 | 176 |
| [src/tests/pages/auth/register.test.tsx](/src/tests/pages/auth/register.test.tsx) | TypeScript JSX | 121 | 28 | 35 | 184 |
| [src/tests/pages/auth/resetPassword.test.tsx](/src/tests/pages/auth/resetPassword.test.tsx) | TypeScript JSX | 134 | 10 | 27 | 171 |
| [src/tests/pages/forgotPassword.test.tsx](/src/tests/pages/forgotPassword.test.tsx) | TypeScript JSX | -113 | -13 | -30 | -156 |
| [src/tests/pages/home.tsx](/src/tests/pages/home.tsx) | TypeScript JSX | 0 | 0 | 1 | 1 |
| [src/tests/pages/login.test.tsx](/src/tests/pages/login.test.tsx) | TypeScript JSX | -119 | -17 | -36 | -172 |
| [src/tests/pages/register.test.tsx](/src/tests/pages/register.test.tsx) | TypeScript JSX | -95 | -19 | -22 | -136 |
| [src/tests/pages/restPassword.test.tsx](/src/tests/pages/restPassword.test.tsx) | TypeScript JSX | -134 | -10 | -27 | -171 |
| [src/tests/server.ts](/src/tests/server.ts) | TypeScript | 32 | 5 | 9 | 46 |
| [src/tests/slices/authSlice.test.ts](/src/tests/slices/authSlice.test.ts) | TypeScript | 0 | 0 | 1 | 1 |
| [src/tests/slices/exchangeSlice.test.ts](/src/tests/slices/exchangeSlice.test.ts) | TypeScript | 91 | 5 | 13 | 109 |
| [src/tests/thunks/authThunk.test.ts](/src/tests/thunks/authThunk.test.ts) | TypeScript | 221 | 69 | 62 | 352 |
| [src/tests/thunks/exchangeThunk.test.ts](/src/tests/thunks/exchangeThunk.test.ts) | TypeScript | 175 | 32 | 45 | 252 |
| [src/tests/thunks/userThunk.test.ts](/src/tests/thunks/userThunk.test.ts) | TypeScript | 163 | 48 | 43 | 254 |
| [src/tests/userThunk.test.ts](/src/tests/userThunk.test.ts) | TypeScript | -373 | -121 | -97 | -591 |
| [src/tests/utils.test.ts](/src/tests/utils.test.ts) | TypeScript | -88 | -29 | -29 | -146 |
| [src/tests/utils/authUtils.test.ts](/src/tests/utils/authUtils.test.ts) | TypeScript | 84 | 29 | 31 | 144 |
| [src/thunks/authThunks/authCheckThunk.ts](/src/thunks/authThunks/authCheckThunk.ts) | TypeScript | 7 | 1 | 3 | 11 |
| [src/thunks/authThunks/loginThunk.ts](/src/thunks/authThunks/loginThunk.ts) | TypeScript | 2 | 2 | 4 | 8 |
| [src/thunks/authThunks/refreshTokenThunk.ts](/src/thunks/authThunks/refreshTokenThunk.ts) | TypeScript | 5 | 0 | 1 | 6 |
| [src/thunks/commentsThunks/createCommentThunk.ts](/src/thunks/commentsThunks/createCommentThunk.ts) | TypeScript | 39 | 1 | 4 | 44 |
| [src/thunks/commentsThunks/deleteCommentThunk.ts](/src/thunks/commentsThunks/deleteCommentThunk.ts) | TypeScript | 27 | 0 | 3 | 30 |
| [src/thunks/commentsThunks/fetchCommentsThunk.ts](/src/thunks/commentsThunks/fetchCommentsThunk.ts) | TypeScript | 47 | 3 | 9 | 59 |
| [src/thunks/commentsThunks/toggleCommentLikeThunk.ts](/src/thunks/commentsThunks/toggleCommentLikeThunk.ts) | TypeScript | 32 | 1 | 5 | 38 |
| [src/thunks/commentsThunks/updateCommentThunk.ts](/src/thunks/commentsThunks/updateCommentThunk.ts) | TypeScript | 39 | 0 | 4 | 43 |
| [src/thunks/exchangeThunks/fetchExchangeDataThunk.ts](/src/thunks/exchangeThunks/fetchExchangeDataThunk.ts) | TypeScript | 59 | 4 | 8 | 71 |
| [src/thunks/exchangeThunks/fetchUserExchangeDataThunk.ts](/src/thunks/exchangeThunks/fetchUserExchangeDataThunk.ts) | TypeScript | 58 | 5 | 7 | 70 |
| [src/thunks/exchangeThunks/updateExchangeDetailsThunk.ts](/src/thunks/exchangeThunks/updateExchangeDetailsThunk.ts) | TypeScript | 66 | 6 | 11 | 83 |
| [src/thunks/exchangeThunks/updateExchangeRatesThunk.ts](/src/thunks/exchangeThunks/updateExchangeRatesThunk.ts) | TypeScript | 64 | 8 | 13 | 85 |
| [src/thunks/notificationThunks/notificationListThunk.ts](/src/thunks/notificationThunks/notificationListThunk.ts) | TypeScript | 37 | 1 | 5 | 43 |
| [src/thunks/notificationThunks/notificationThunk.ts](/src/thunks/notificationThunks/notificationThunk.ts) | TypeScript | -34 | -4 | -6 | -44 |
| [src/thunks/postsThunks/fetchUserPostsThunk.ts](/src/thunks/postsThunks/fetchUserPostsThunk.ts) | TypeScript | 0 | -1 | 1 | 0 |
| [src/thunks/postsThunks/toggleLikeThunk.ts](/src/thunks/postsThunks/toggleLikeThunk.ts) | TypeScript | 36 | 3 | 8 | 47 |
| [src/thunks/postsThunks/updatePostThunk.ts](/src/thunks/postsThunks/updatePostThunk.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [src/thunks/searchThunks/fetchDiscoveryThunk.ts](/src/thunks/searchThunks/fetchDiscoveryThunk.ts) | TypeScript | 57 | 3 | 8 | 68 |
| [src/thunks/searchThunks/fetchResultsThunk.ts](/src/thunks/searchThunks/fetchResultsThunk.ts) | TypeScript | 82 | 3 | 7 | 92 |
| [src/thunks/settingsThunks/deleteAccountThunk.ts](/src/thunks/settingsThunks/deleteAccountThunk.ts) | TypeScript | 39 | 7 | 7 | 53 |
| [src/thunks/settingsThunks/requestEmailChangeThunk.ts](/src/thunks/settingsThunks/requestEmailChangeThunk.ts) | TypeScript | 35 | 0 | 4 | 39 |
| [src/thunks/settingsThunks/updatePasswordThunk.ts](/src/thunks/settingsThunks/updatePasswordThunk.ts) | TypeScript | 35 | 0 | 4 | 39 |
| [src/thunks/settingsThunks/updateUsernameThunk.ts](/src/thunks/settingsThunks/updateUsernameThunk.ts) | TypeScript | 41 | 1 | 6 | 48 |
| [src/thunks/settingsThunks/uploadProfilePictureThunk.ts](/src/thunks/settingsThunks/uploadProfilePictureThunk.ts) | TypeScript | 35 | 1 | 7 | 43 |
| [src/thunks/userThunks/fetchUserProfile.ts](/src/thunks/userThunks/fetchUserProfile.ts) | TypeScript | 7 | 1 | 3 | 11 |
| [src/thunks/userThunks/followUserThunk.ts](/src/thunks/userThunks/followUserThunk.ts) | TypeScript | 37 | 8 | 10 | 55 |
| [src/thunks/userThunks/registerThunk.ts](/src/thunks/userThunks/registerThunk.ts) | TypeScript | 7 | 4 | 1 | 12 |
| [src/thunks/userThunks/requestPasswordResetThunk.ts](/src/thunks/userThunks/requestPasswordResetThunk.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [src/thunks/userThunks/resetPasswordThunk.ts](/src/thunks/userThunks/resetPasswordThunk.ts) | TypeScript | 6 | 1 | 1 | 8 |
| [src/types/exchange.ts](/src/types/exchange.ts) | TypeScript | 18 | 3 | 4 | 25 |
| [src/types/settings.ts](/src/types/settings.ts) | TypeScript | 15 | 0 | 1 | 16 |
| [src/types/user.ts](/src/types/user.ts) | TypeScript | 6 | 5 | 1 | 12 |
| [src/types/userProfile.ts](/src/types/userProfile.ts) | TypeScript | 12 | 0 | 0 | 12 |
| [src/utils/commentUtils.ts](/src/utils/commentUtils.ts) | TypeScript | 26 | 4 | 2 | 32 |
| [src/utils/exchangeUtils.ts](/src/utils/exchangeUtils.ts) | TypeScript | 54 | 37 | 12 | 103 |
| [src/utils/notification\_util.ts](/src/utils/notification_util.ts) | TypeScript | 46 | 4 | 8 | 58 |
| [src/utils/searchUtils.ts](/src/utils/searchUtils.ts) | TypeScript | 24 | 7 | 5 | 36 |
| [src/utils/tagsUtils.ts](/src/utils/tagsUtils.ts) | TypeScript | 8 | 8 | 2 | 18 |
| [src/vite-env.d.ts](/src/vite-env.d.ts) | TypeScript | 0 | 8 | 0 | 8 |
| [tsconfig.app.json](/tsconfig.app.json) | JSON | 0 | 6 | 1 | 7 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 0 | 3 | 0 | 3 |
| [tsconfig.node.json](/tsconfig.node.json) | JSON | 0 | 7 | 0 | 7 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details