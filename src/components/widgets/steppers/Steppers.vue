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

  get forceMove () {
    return this.$store.state.config.uiSettings.toolhead.forceMove
  }

  async toggleForceMove () {
    if (!this.forceMove && this.$store.state.config.uiSettings.general.forceMoveToggleWarning) {
      const result = await this.$confirm(
        this.$tc('app.general.simple_form.msg.confirm_forcemove_toggle'),
        { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$warning' }
      )

      if (!result) {
        return
      }
    }

    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.forceMove',
      value: !this.forceMove,
      server: false
    })
  }
}
</script>
