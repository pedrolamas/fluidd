<template>
  <collapsable-card
    title="Steppers"
    icon="$retract"
    :draggable="!fullScreen"
    :collapsable="!fullScreen"
    layout-path="dashboard.steppers-card"
  >
    <template #menu>
      <app-btn
        v-if="supportsForceMove"
        :disabled="!klippyReady || printerPrinting"
        small
        class="ml-1"
        :color="forceMove ? 'error' : undefined"
        @click="toggleForceMove"
      >
        FORCE_MOVE
      </app-btn>

      <app-btn
        v-if="!fullScreen"
        color=""
        fab
        x-small
        text
        class="ml-1"
        @click="$filters.routeTo($router, '/tune')"
      >
        <v-icon>$fullScreen</v-icon>
      </app-btn>
    </template>

    <steppers />
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import Steppers from './Steppers.vue'

@Component({
  components: {
    Steppers
  }
})
export default class SteppersCard extends Mixins(StateMixin) {
  @Prop({ type: Boolean, default: false })
  readonly fullScreen!: boolean

  get supportsForceMove () {
    return this.$store.getters['printer/getPrinterSettings']('force_move.enable_force_move') ?? false
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
