# Job Description for Disfactory Project

[Disfactory - 違章工廠檢舉系統](https://github.com/Disfactory/frontend/) 徵求各路前端工程師，專案描述如下：

- 前後端分離的 Vue 2~3 專案。會說 2 到 3 是因為雖然用的版本是 Vue 2，但有用到 Vue 3 [composition API](https://github.com/vuejs/composition-api) 的寫法，未來升級會相對容易
- Vue CLI 開的專案，符合一般習慣
- 使用 TypeScript 並開啟嚴格模式
- [OpenLayers](https://openlayers.org/) 來呈現地圖，與國土測繪圖資服務雲用同一套方便作業，如果你換一套也 OK
- 使用 [Vuetify](https://vuetifyjs.com/) 這套 Material Design 風格的 Vue Framework
- 專案用 GitHub Actions 設定了 CI (linting & typecheck，目前並無測試) 及 CD ([staging](https://dev.disfactory.tw) & [production](https://disfactory.tw))，也會為每個 PR 自動部屬 Review App (via Netlify)，手動測試驗證相信會非常舒適
- 並「沒有」用到 Vuex 及 Vue-router 等函式庫，列在這不是優缺點，而是現況
- 目前還在使用 npm，若有升級到 yarn 的想法，這會是你第一個 PR :stuck_out_tongue_closed_eyes: 
- 與設計使用 Figma 溝通畫面
