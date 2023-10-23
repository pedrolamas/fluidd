<template>
  <v-card-text>
    <steppers-stepper
      v-for="stepper in steppers"
      :key="stepper.key"
      :stepper="stepper"
    />
  </v-card-text>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import SteppersStepper from './SteppersStepper.vue'
import type { Stepper } from '@/store/printer/types'

@Component({
  components: {
    SteppersStepper
  }
})
export default class Steppers extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly fullScreen!: boolean

  get steppers (): Stepper[] {
    return this.$store.getters['printer/getSteppers'] as Stepper[]
  }
}
</script>
