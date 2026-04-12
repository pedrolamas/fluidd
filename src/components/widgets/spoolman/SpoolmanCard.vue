<template>
  <collapsable-card
    :title="tc('app.spoolman.title.spoolman')"
    icon="$filament"
    draggable
    layout-path="dashboard.spoolman-card"
  >
    <template #menu>
      <app-btn
        v-if="!klippyReady || !targetableMacros.length"
        small
        class="me-1 my-1"
        :disabled="!isConnected"
        @click="handleSelectSpool()"
      >
        {{ t('app.spoolman.label.change_spool') }}
      </app-btn>

      <v-menu
        v-else
        bottom
        left
        offset-y
        transition="slide-y-transition"
        min-width="150"
      >
        <template #activator="{ on, attrs, value }">
          <app-btn
            v-bind="attrs"
            small
            class="me-1 my-1"
            :disabled="!isConnected"
            v-on="on"
          >
            {{ t('app.spoolman.label.change_spool') }}
            <v-icon
              small
              class="ml-1"
              :class="{ 'rotate-180': value }"
            >
              $chevronDown
            </v-icon>
          </app-btn>
        </template>

        <v-list dense>
          <v-list-item @click="handleSelectSpool()">
            <v-list-item-content>
              <v-list-item-title>
                {{ t('app.spoolman.label.active_spool') }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-icon v-if="activeSpool">
              <v-icon
                :color="getSpoolColor(activeSpool)"
                class="spool-icon"
              >
                $filament
              </v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-divider />

          <template v-for="macro of targetableMacros">
            <v-list-item
              :key="macro.name"
              :class="{
                primary: macro.variables?.active
              }"
              @click="handleSelectSpool(macro)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ macro.name.toUpperCase() }}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-icon v-if="macro.variables.spool_id">
                <v-icon
                  :color="getSpoolColor(getSpoolById(macro.variables.spool_id))"
                  class="spool-icon"
                >
                  $filament
                </v-icon>
              </v-list-item-icon>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </template>

    <v-progress-linear
      v-if="activeSpool && vuetify.breakpoint.lgAndDown"
      :value="activeSpool.progress"
      :height="6"
      :color="getSpoolColor(activeSpool)"
    />

    <v-card-text>
      <v-row>
        <template v-if="activeSpool">
          <v-col
            v-for="(fields, i) in selectedCardFields"
            :key="`spoolman-card-col-${i}`"
            align-self="center"
          >
            <template v-for="field in fields">
              <status-label
                :key="`spoolman-card-${field}`"
                :label="getFieldLabel(field)"
                :label-width="86"
              >
                <template v-if="field === 'remaining_weight'">
                  <span v-if="remainingFilamentUnit === 'weight'">
                    {{ getFormattedField('remaining_weight') }}
                    <small>/ {{ getFormattedField('initial_weight') }}</small>
                  </span>
                  <span v-else-if="remainingFilamentUnit === 'length'">
                    {{ getFormattedField('remaining_length') }}
                    <small>/ {{ getFormattedField('initial_length') }}</small>
                  </span>
                </template>

                <template v-else-if="field === 'used_weight'">
                  <span v-if="remainingFilamentUnit === 'weight'">
                    {{ getFormattedField('used_weight') }}
                    <small>/ {{ getFormattedField('initial_weight') }}</small>
                  </span>
                  <span v-else-if="remainingFilamentUnit === 'length'">
                    {{ getFormattedField('used_length') }}
                    <small>/ {{ getFormattedField('initial_length') }}</small>
                  </span>
                </template>

                <template v-else-if="getTooltipField(field) != null">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <span
                        v-bind="attrs"
                        v-on="on"
                      >
                        {{ getFormattedField(field) }}
                      </span>
                    </template>

                    {{ getTooltipField(field) }}
                  </v-tooltip>
                </template>

                <span v-else>{{ getFormattedField(field) }}</span>
              </status-label>
            </template>
          </v-col>
        </template>

        <v-col
          v-else-if="isConnected"
          align-self="center"
        >
          {{ t('app.spoolman.msg.tracking_inactive') }}
        </v-col>

        <v-col
          v-else
          align-self="center"
        >
          {{ t('app.spoolman.msg.not_connected') }}
        </v-col>

        <v-col
          v-if="vuetify.breakpoint.xl"
          cols="auto"
          align-self="center"
          class="pa-0"
        >
          <v-progress-circular
            v-if="activeSpool"
            :rotate="-90"
            :size="102"
            :width="7"
            :value="activeSpool.progress"
            color="primary"
            class="mr-4 flex-column"
          >
            <v-icon
              :color="getSpoolColor(activeSpool)"
              size="100"
              class="spool-icon"
            >
              $filament
            </v-icon>
          </v-progress-circular>
          <v-icon
            v-else-if="isConnected"
            size="55"
          >
            $progressQuestion
          </v-icon>
          <v-icon
            v-else
            color="warning"
            size="55"
          >
            $warning
          </v-icon>
        </v-col>
      </v-row>
    </v-card-text>

    <template #collapsed-content>
      <v-progress-linear
        v-if="activeSpool"
        :value="activeSpool.progress"
        :height="6"
        :color="getSpoolColor(activeSpool)"
      />
    </template>
  </collapsable-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/composables/useStore'
import { useI18n } from '@/composables/useI18n'
import { useStateMixin } from '@/composables/useStateMixin'
import { useVuetify } from '@/composables/useVuetify'
import { Filters } from '@/plugins/filters'
import type { Spool } from '@/store/spoolman/types'
import StatusLabel from '@/components/widgets/status/StatusLabel.vue'
import type { Macro } from '@/store/macros/types'
import type { SpoolmanRemainingFilamentUnit } from '@/store/config/types'

type MacroWithSpoolId = Macro & {
  variables: Record<string, unknown> & {
    spool_id: number | null
  }
}

const { typedState, typedGetters, typedCommit } = useStore()
const { t, tc } = useI18n()
const { klippyReady } = useStateMixin()
const vuetify = useVuetify()

function handleSelectSpool (targetMacro?: Macro) {
  typedCommit('spoolman/setDialogState', {
    show: true,
    targetMacro: targetMacro?.name
  })
}

const selectedCardFields = computed((): string[][] => {
  const fields = typedState.config.uiSettings.spoolman.selectedCardFields
  const columnCount = fields.length > 1 ? 2 : 1
  const elementsPerColumn = Math.ceil(fields.length / columnCount)
  return new Array(columnCount).fill(undefined).map((_, i) => fields.slice(i * elementsPerColumn, (i + 1) * elementsPerColumn))
})

const activeSpool = computed((): Spool | undefined => {
  if (!isConnected.value) return undefined
  return typedGetters['spoolman/getActiveSpool']
})

const currency = computed((): string | null => typedState.spoolman.currency)

const isConnected = computed((): boolean => typedState.spoolman.connected)

const targetableMacros = computed(() => {
  const macros: Macro[] = typedGetters['macros/getMacros']

  return macros
    .filter((macro): macro is MacroWithSpoolId => macro.variables != null && 'spool_id' in macro.variables)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
})

const remainingFilamentUnit = computed((): SpoolmanRemainingFilamentUnit =>
  typedState.config.uiSettings.spoolman.remainingFilamentUnit
)

function getSpoolById (id: number): Spool | undefined {
  return typedGetters['spoolman/getSpoolById'](id)
}

function getSpoolColor (spool?: Spool) {
  return spool?.filament.color_hex ?? (vuetify.theme.dark ? '#fff' : '#000')
}

function getFieldLabel (field: string) {
  switch (field) {
    case 'remaining_weight':
      return t('app.spoolman.label.remaining')

    case 'used_weight':
      return t('app.spoolman.label.used')

    default:
      return t(`app.spoolman.label.${field}`)
  }
}

function getFormattedField (field: string) {
  if (!activeSpool.value) return '-'

  switch (field) {
    case 'vendor':
      return activeSpool.value.filament.vendor?.name || '-'

    case 'filament_name':
      return activeSpool.value.filament.name

    case 'material':
      return activeSpool.value.filament.material || '-'

    case 'first_used':
      return activeSpool.value.first_used ? Filters.formatRelativeTimeToNow(activeSpool.value.first_used) : tc('app.setting.label.never')

    case 'last_used':
      return activeSpool.value.last_used ? Filters.formatRelativeTimeToNow(activeSpool.value.last_used) : tc('app.setting.label.never')

    case 'price':
      return activeSpool.value.price != null ? Filters.getReadableCurrencyString(activeSpool.value.price, currency.value ?? '') : '-'

    case 'density':
      return activeSpool.value.filament.density || '-'

    case 'diameter':
      return activeSpool.value.filament.diameter ? Filters.getReadableLengthString(activeSpool.value.filament.diameter) : '-'

    case 'extruder_temp':
      return activeSpool.value.filament.settings_extruder_temp || '-'

    case 'bed_temp':
      return activeSpool.value.filament.settings_bed_temp || '-'

    case 'remaining_weight':
      return activeSpool.value.remaining_weight != null ? Filters.getReadableWeightString(activeSpool.value.remaining_weight) : '-'

    case 'remaining_length':
      return activeSpool.value.remaining_length != null ? Filters.getReadableLengthString(activeSpool.value.remaining_length) : '-'

    case 'used_weight':
      return activeSpool.value.used_weight != null ? Filters.getReadableWeightString(activeSpool.value.used_weight) : '-'

    case 'used_length':
      return activeSpool.value.used_length != null ? Filters.getReadableLengthString(activeSpool.value.used_length) : '-'

    case 'initial_weight':
      return activeSpool.value.initial_weight != null ? Filters.getReadableWeightString(activeSpool.value.initial_weight) : '-'

    case 'initial_length':
      return activeSpool.value.initial_length != null ? Filters.getReadableLengthString(activeSpool.value.initial_length) : '-'

    default:
      return activeSpool.value[field as keyof Spool] || '-'
  }
}

function getTooltipField (field: string) {
  if (!activeSpool.value) return null

  switch (field) {
    case 'first_used':
      return activeSpool.value.first_used ? Filters.formatDateTime(activeSpool.value.first_used) : null

    case 'last_used':
      return activeSpool.value.last_used ? Filters.formatDateTime(activeSpool.value.last_used) : null

    default:
      return null
  }
}
</script>
