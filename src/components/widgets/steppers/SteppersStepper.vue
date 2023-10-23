<template>
  <v-row
    no-gutters
    class="mb-2"
  >
    <v-col>
      <app-up-down-btn-group
        :values="values"
        color="error"
        class="d-flex"
        :disabled="!klippyReady || !forceMove"
        @click="sendForceMoveGcode($event)"
      >
        <app-btn
          color="primary"
          class="px-2 flex-grow-1"
          :disabled="!klippyReady"
          @click="sendStepperBuzzGcode"
        >
          <v-icon
            small-icon
            class="mr-1"
          >
            $stepperBuzz
          </v-icon>
          {{ stepper.prettyName }}
        </app-btn>
      </app-up-down-btn-group>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { Stepper } from '@/store/printer/types'

type StepperType = 'extruder' | 'z' | undefined

@Component({})
export default class StepperStepper extends Mixins(StateMixin) {
  @Prop({ type: Object })
  readonly stepper!: Stepper

  get forceMove () {
    return this.$store.state.config.uiSettings.toolhead.forceMove
  }

  get values (): number[] {
    return [1, 10, 50]
  }

  get rate (): number {
    switch (this.stepperType) {
      case 'extruder':
        return this.$store.state.config.uiSettings.general.defaultExtrudeSpeed

      case 'z':
        return this.$store.state.config.uiSettings.general.defaultToolheadZSpeed

      default:
        return this.$store.state.config.uiSettings.general.defaultToolheadXYSpeed
    }
  }

  get accel (): number {
    const maxAccel = this.$store.state.printer.printer.toolhead.max_accel

    switch (this.stepperType) {
      case 'extruder':
        return Math.min(
          this.$store.getters['printer/getPrinterSettings']('extruder.max_extrude_only_accel'),
          maxAccel
        )

      case 'z':
        return Math.min(
          this.$store.getters['printer/getPrinterSettings']('printer.max_z_accel'),
          maxAccel
        )

      default:
        return maxAccel
    }
  }

  get stepperType () : StepperType {
    const { key } = this.stepper

    if (key.startsWith('stepper_z')) {
      return 'z'
    }
    if (key.startsWith('extruder')) {
      return 'extruder'
    }
  }

  sendForceMoveGcode (distance: number) {
    this.sendGcode(`FORCE_MOVE STEPPER="${this.stepper.key}" DISTANCE=${distance} VELOCITY=${this.rate} ACCEL=${this.accel}`)
  }

  sendStepperBuzzGcode () {
    this.sendGcode(`STEPPER_BUZZ STEPPER="${this.stepper.key}"`)
  }
}
</script>
