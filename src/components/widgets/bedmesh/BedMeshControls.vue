<template>
  <collapsable-card
    :title="$t('app.general.title.bedmesh_controls')"
    :lazy="false"
    icon="$bedMesh"
  >
    <template #menu>
      <app-btn-collapse-group>
        <app-btn
          v-if="isManualProbeActive"
          :disabled="!klippyReady || printerPrinting"
          small
          class="me-1 my-1"
          @click="manualProbeDialogOpen = true"
        >
          {{ $t('app.tool.tooltip.manual_probe') }}
        </app-btn>
      </app-btn-collapse-group>
    </template>

    <template v-if="bedMeshProfiles.length > 0">
      <v-simple-table>
        <thead>
          <tr>
            <th>{{ $t('app.general.label.name') }}</th>
            <th>&nbsp;</th>
            <th>{{ $t('app.general.label.range') }}</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in bedMeshProfiles"
            :key="item.name"
          >
            <td class="">
              {{ item.name }}
            </td>
            <td>
              <v-chip
                v-if="item.active"
                small
                block
              >
                {{ $t('app.bedmesh.label.active') }}
              </v-chip>
            </td>
            <td class="focus--text">
              <span>
                {{ item.range.toFixed(4) }}
              <!-- / {{ mesh.min }} / {{ mesh.mid }} / {{ mesh.max }} -->
              </span>
            </td>
            <td
              class="text-right"
              nowrap
            >
              <v-tooltip
                v-if="!item.active"
                bottom
              >
                <template #activator="{ on, attrs }">
                  <app-btn
                    v-bind="attrs"
                    icon
                    @click="loadProfile(item.name)"
                    v-on="on"
                  >
                    <v-icon dense>
                      $open
                    </v-icon>
                  </app-btn>
                </template>
                <span>{{ $t('app.bedmesh.tooltip.load') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <app-btn
                    v-bind="attrs"
                    icon
                    :disabled="item.adaptive"
                    @click="removeProfile(item.name)"
                    v-on="on"
                  >
                    <v-icon dense>
                      $delete
                    </v-icon>
                  </app-btn>
                </template>
                <span>{{ $t('app.bedmesh.tooltip.delete') }}</span>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider />
    </template>

    <v-card-text>
      <div
        v-if="bedMeshProfiles.length === 0"
        class="mb-4"
      >
        {{ $t('app.bedmesh.msg.not_found') }}
      </div>
      <v-row>
        <v-col cols="6">
          <app-btn
            :disabled="!meshLoaded"
            small
            block
            class="mb-2"
            @click="clearMesh()"
          >
            {{ $t('app.general.btn.clear_profile') }}
          </app-btn>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                small
                block
                class="mb-2"
                :loading="hasWait(Waits.onMeshCalibrate)"
                :disabled="printerBusy || !allHomed"
                v-on="on"
                @click="calibrate()"
              >
                {{ $t('app.general.btn.calibrate') }}
              </app-btn>
            </template>
            <span>{{ $t(`app.bedmesh.tooltip.calibrate`) }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <app-btn
                v-bind="attrs"
                block
                small
                color="primary"
                :disabled="!meshLoaded"
                v-on="on"
                @click="handleOpenSaveDialog()"
              >
                {{ $t('app.general.btn.save_as') }}
              </app-btn>
            </template>
            <span>{{ $t('app.bedmesh.tooltip.save') }}</span>
          </v-tooltip>
        </v-col>
        <v-col cols="6">
          <app-btn
            block
            small
            class="mb-2"
            :loading="hasWait(Waits.onHomeAll)"
            :disabled="printerBusy"
            :color="(!allHomed) ? 'primary' : undefined"
            @click="homeAll"
          >
            <v-icon
              small
              class="mr-1"
            >
              $home
            </v-icon> {{ $t('app.general.btn.all') }}
          </app-btn>

          <app-btn
            v-if="printerSupportsQgl"
            :loading="hasWait(Waits.onQGL)"
            :disabled="printerBusy"
            block
            class="mb-2"
            small
            @click="sendGcode('QUAD_GANTRY_LEVEL', Waits.onQGL)"
          >
            {{ $t('app.general.btn.quad_gantry_level') }}
          </app-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-radio-group
            v-model="matrix"
            :disabled="!meshLoaded"
            column
            hide-details
            class="mt-0 mb-2"
          >
            <v-radio
              :label="$t('app.bedmesh.label.probed_matrix')"
              value="probed_matrix"
            />
            <v-radio
              :label="$t('app.bedmesh.label.mesh_matrix')"
              value="mesh_matrix"
            />
          </v-radio-group>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-checkbox
            v-model="wireframe"
            :disabled="!meshLoaded"
            :label="$t('app.bedmesh.label.wireframe')"
            hide-details
            class="mt-0"
          />

          <v-checkbox
            v-model="flatSurface"
            :disabled="!meshLoaded"
            :label="$t('app.bedmesh.label.flat_surface')"
            hide-details
            class="mt-1"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-slider
            v-model="mapScale"
            :label="$t('app.bedmesh.label.scale')"
            :disabled="!meshLoaded"
            :tick-labels="mapScaleLabels"
            :min="0"
            :max="0.2"
            step="0.1"
            ticks="always"
            tick-size="4"
          />

          <v-slider
            v-model="boxScale"
            :label="$t('app.bedmesh.label.box_scale')"
            :disabled="!meshLoaded"
            :tick-labels="boxScaleLabels"
            :min="1"
            :max="2"
            step="0.5"
            ticks="always"
            tick-size="4"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <save-mesh-dialog
      v-if="saveDialogState.open"
      v-model="saveDialogState.open"
      :existing-name="saveDialogState.existingName"
      :adaptive="saveDialogState.adaptive"
      @save="handleMeshSave"
    />
  </collapsable-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SaveMeshDialog from './SaveMeshDialog.vue'
import { useStateMixin } from '@/composables/useStateMixin'
import { useToolheadMixin } from '@/composables/useToolheadMixin'
import { useStore } from '@/composables/useStore'
import { useConfirm } from '@/composables/useConfirm'
import { useI18n } from '@/composables/useI18n'
import { Waits } from '@/globals'
import type {
  MeshState,
  MatrixType,
  BedMeshProfileListEntry
} from '@/store/mesh/types'
import { encodeGcodeParamValue } from '@/util/gcode-helpers'

const mapScaleLabels = ['min', '0.1', '0.2']
const boxScaleLabels = ['1.0', '1.5', '2.0']

const saveDialogState = ref({
  open: false,
  existingName: 'default',
  adaptive: false
})

const { hasWait, sendGcode, printerBusy, printerPrinting, klippyReady, homeAll } = useStateMixin()
const { allHomed, isManualProbeActive, manualProbeDialogOpen } = useToolheadMixin()
const { typedGetters, typedState, typedDispatch } = useStore()
const confirm = useConfirm()
const { t, tc } = useI18n()

const meshState = computed<MeshState>(() => typedState.mesh)

const matrix = computed({
  get: (): MatrixType => meshState.value.matrix,
  set: (val: MatrixType) => typedDispatch('mesh/onMatrix', val)
})

const mapScale = computed({
  get: () => meshState.value.scale,
  set: (val: number) => typedDispatch('mesh/onScale', val)
})

const boxScale = computed({
  get: () => meshState.value.boxScale,
  set: (val: number) => typedDispatch('mesh/onBoxScale', val)
})

const wireframe = computed({
  get: () => meshState.value.wireframe,
  set: (val: boolean) => typedDispatch('mesh/onWireframe', val)
})

const flatSurface = computed({
  get: () => meshState.value.flatSurface,
  set: (val: boolean) => typedDispatch('mesh/onFlatSurface', val)
})

const bedMeshProfiles = computed<BedMeshProfileListEntry[]>(() => typedGetters['mesh/getBedMeshProfiles'])

const currentMesh = computed<Klipper.BedMeshState | undefined>(() => typedState.printer.printer.bed_mesh)

const meshLoaded = computed<boolean>(() => !!currentMesh.value?.profile_name)

const printerSupportsQgl = computed<boolean>(() => {
  const printerSettings: Klipper.SettingsState = typedGetters['printer/getPrinterSettings']

  return 'quad_gantry_level' in printerSettings
})

function calibrate () {
  sendGcode('BED_MESH_CALIBRATE', Waits.onMeshCalibrate)
}

async function clearMesh () {
  const result = (
    !printerPrinting.value ||
    await confirm(
      t('app.general.simple_form.msg.confirm_load_bedmesh_profile', { name }).toString(),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )
  if (result) {
    sendGcode('BED_MESH_CLEAR')
  }
}

async function loadProfile (name: string) {
  const result = (
    !printerPrinting.value ||
    await confirm(
      tc('app.general.simple_form.msg.confirm_clear_mesh'),
      { title: tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )
  )

  if (result) {
    sendGcode(`BED_MESH_PROFILE LOAD=${encodeGcodeParamValue(name)}`)
  }
}

function removeProfile (name: string) {
  sendGcode(`BED_MESH_PROFILE REMOVE=${encodeGcodeParamValue(name)}`)
}

function handleMeshSave (config: { name: string; removeDefault: boolean }) {
  const profileName = currentMesh.value?.profile_name

  if (config.name !== profileName) {
    sendGcode(`BED_MESH_PROFILE SAVE=${encodeGcodeParamValue(config.name)}`)
  }

  if (config.removeDefault && profileName) {
    sendGcode(`BED_MESH_PROFILE REMOVE=${encodeGcodeParamValue(profileName)}`)
  }
}

function handleOpenSaveDialog () {
  const profileName = currentMesh.value?.profile_name

  if (!profileName) {
    return
  }

  const profile = bedMeshProfiles.value.find(mesh => mesh.name === profileName)

  saveDialogState.value = {
    open: true,
    existingName: profileName,
    adaptive: profile?.adaptive ?? false
  }
}
</script>

<style lang="scss" scoped>
  :deep(.v-input__slider .v-input__slot .v-label) {
    min-width: 82px;
  }
</style>
