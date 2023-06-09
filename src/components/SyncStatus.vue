<template>
    <el-tooltip
        placement="top"
        :content="loading ? loadingNotice : note ? 'Click to view on Crossbell' : 'Click to sync to Crossbell'"
    >
        <div
            class="flex w-6 h-6"
            :class="{
                'fill-[#5088ff]': note,
                'fill-[#888888]': !note,
                'opacity-50 mr-4': true,
            }"
            cssc="sync-status"
        >
            <el-icon class="w-full h-full is-loading" v-if="loading">
                <Loading />
            </el-icon>
            <span v-else @click="syncOrRedirect" class="flex w-full h-full items-center logo" v-html="logo" />
        </div>
    </el-tooltip>
</template>
<script setup lang="ts">
import logo from '../assets/logo.svg?raw';
import { ref } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import type { Note } from 'unidata.js';

const props = defineProps({
    getNote: {
        type: Function,
        required: true,
    },
    postNote: {
        type: Function,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
});

const note = ref<Note>();
const loading = ref(true);
const loadingNotice = ref('Loading...');

const syncOrRedirect = async (e: any) => {
    loading.value = true;
    e.preventDefault();
    if (!note.value) {
        loadingNotice.value = 'Syncing...';
        await props.postNote();
        note.value = await props.getNote();
    } else {
        const scan = note.value.related_urls?.find((url) => url.startsWith('https://scan.crossbell.io/tx/'));
        if (scan) {
            window.open(scan, '_blank');
        }
    }
    loading.value = false;
};

const init = async () => {
    note.value = await props.getNote();
    if (loadingNotice.value !== 'Syncing...') {
        loading.value = false;
    }
};

init();

async function setStatus(status: string) {
    switch (status) {
        case 'syncing':
            loading.value = true;
            loadingNotice.value = 'Syncing...';
            break;
        case 'synced':
            loadingNotice.value = 'Loading...';
            init();
            break;
    }
}

if (!(window as any).cssc) {
    (window as any).cssc = {};
}
if (!(window as any).cssc.updateSyncing) {
    (window as any).cssc.updateSyncing = {};
}
(window as any).cssc.updateSyncing[props.link] = setStatus;
if ((window as any).cssc.syncing === props.link) {
    setStatus('syncing');
}
</script>
