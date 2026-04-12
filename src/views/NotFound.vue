<template>
  <v-row
    :dense="$vuetify.breakpoint.smAndDown"
    justify="center"
    align="center"
  >
    <v-col>
      <center>
        <div class="text-h5">
          {{ $t('app.general.title.not_found') }}
        </div>
        <app-btn
          to="/"
          class="mt-5"
        >
          {{ $t('app.general.btn.return_dashboard') }}
        </app-btn>
      </center>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
</script>
