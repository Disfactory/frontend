<template>
  <div class="image-upload-form w-100">
    <v-container style="max-width: 620px; position: relative;" class="pt-3 pt-md-12 pb-md-8">
      <h2 class="mb-4 secondary--text">上傳工廠照片</h2>

      <p>請至少上傳一張工廠照片。</p>

      <h3 class="mb-3 mt-7 primary--text required">工廠照片</h3>

      <div class="flex align-items-center mb-3">
        <v-btn :disabled="uploading" outlined class="mr-3">
          <label>
            <input multiple type="file" accept="image/*" ref="image" style="display: none;" @change="onChange" :disabled="uploading">
              新增照片
          </label>
        </v-btn>

        <span v-if="uploading && !disableProgressiveUpload">上傳中...</span>
        <span v-if="valid && !uploading && !error && !disableProgressiveUpload">
          上傳成功
          <v-icon class="primary--text">mdi-checkbox-marked-circle</v-icon>
        </span>
        <span v-if="error && !disableProgressiveUpload">上傳錯誤</span>
      </div>

      <div class="preview-images-container mb-2">
        <div v-for="image of previewImages" :key="image.token" class="uploaded-image">
          <img :src="image.src" />
          <button class="remove-image-btn" @click="removeImage(image)" />
        </div>
      </div>

      <hr>

      <h2 class="mt-7 mb-2 secondary--text">聯絡資訊（非必填）</h2>

      <p>
        如果對於照片有疑問，<br>
        我們會透過以下提供的資訊聯絡你。<br>
        如不願揭露自己身份，可跳過不填。
      </p>

      <h3 class="primary--text mt-7 mb-2">聯絡人暱稱</h3>

      <v-text-field
        outlined
        placeholder="例：林先生、林小姐"
        v-model="formState.nickname"
      ></v-text-field>

      <h3 class="primary--text mt-7 mb-2">聯絡方式 (email或電話)</h3>

      <v-text-field
        outlined
        placeholder="例：abc@email.com、0920-123456"
        v-model="formState.contact"
      ></v-text-field>

      <div class="bottom-button-container w-100 d-flex justify-center align-items-center px-xs-3 pb-md-9">
        <v-btn x-large rounded @click="onSubmit" :disabled="!valid" style="width: 100%; max-width: 345px;" color="primary">
          {{ submitText || '下一步' }}
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'
import { UploadedImage } from '../api'
export default createComponent({
  props: {
    previewImages: {
      type: Array,
      default: []
    },
    uploading: {
      default: false
    },
    error: {
      default: null
    },
    onClickRemoveImage: {
      type: Function
    },
    submit: {
      type: Function
    },
    valid: {
      type: Boolean,
      default: false
    },
    formState: {
      type: Object
    },
    submitText: {
      type: String
    },
    disableProgressiveUpload: {
      type: Boolean,
      default: false
    }
  },
  name: 'ImageUploadForm',
  setup (props, context) {
    return {
      images: [],
      onChange: function (e: InputEvent) {
        context.emit('input', (e.target as HTMLInputElement).files)
      },
      onSubmit () {
        if (props.valid && typeof props.submit === 'function') {
          props.submit()
        }
      },
      removeImage: (image: UploadedImage) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        props.onClickRemoveImage!(image)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/components/preview-images.scss';

.image-upload-form {
  @import '@/styles/typography.scss';

  background-color: white;
  z-index: 1;
  position: absolute;
  height: 100%;

  padding-bottom: 50px;
  overflow-y: auto;
  overflow-x: hidden;
}

.bottom-button-container {
  background: white;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 10px 15px;
}

hr {
  color: #EAF3BF;
  border-color: #EAF3BF;
  background-color: #EAF3BF;
  height: 1px;
  border-width: inherit;
}

</style>
