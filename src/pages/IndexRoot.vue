<template>
    <div class="text-center w-full h-full flex items-center justify-center">
        <div class="pb-8">
            <div class="inline-block rounded-full align-middle fill-[#5088ff] w-36 h-36">
                <span class="flex w-full h-full items-center logo" v-html="logo" />
            </div>
            <h1 class="text-4xl font-bold my-6">Welcome to CrossSync! 👋</h1>
            <el-button type="primary" :loading="isConnecting" round size="large" class="text-xl mt-2" @click="connect"
                >Connect Wallet</el-button
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { connect as wConn } from '@/common/wallet';
import { useStore } from '@/common/store';
import { ref } from 'vue';
import Unidata from 'unidata.js';
import { ElMessage } from 'element-plus';
import { ethers } from 'ethers';
import { Contract } from 'crossbell.js';
import logo from '../assets/logo.svg?raw';

const store = useStore();
const router = useRouter();

if (store.state.settings.address) {
    if (!store.state.characters?.list.length) {
        router.push('/mint');
    } else if (!store.state.settings.handle) {
        router.push('/characters');
    } else {
        router.push('/home');
    }
}

const isConnecting = ref(false);

const connect = async (force = true) => {
    isConnecting.value = true;

    try {
        const provider = await wConn(force);
        if (provider) {
            ElMessage.success('Wallet connected successfully, start system initializing...');
            window.unidata = new Unidata({
                ethereumProvider: provider,
            });
            const web3Provider = new ethers.providers.Web3Provider(provider);
            const address = await web3Provider.getSigner().getAddress();
            await store.dispatch('setSettings', {
                address: address,
            });
            const c = new Contract(provider);
            await c.connect();
            const balance = (await c.getBalance(address)).data;
            if (parseInt(balance) < 0.02 * Math.pow(10, 18)) {
                await router.push('/faucet');
            } else if (store.state.characters?.list.length) {
                await router.push('/characters');
            } else {
                await router.push('/mint');
            }
        }
    } catch (e: any) {
        ElMessage.error('Failed to connect: ' + e.message);
    }

    isConnecting.value = false;
};
</script>

<style></style>
