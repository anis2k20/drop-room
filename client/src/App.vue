<script setup lang="ts">
import { ref } from "vue";
import { usePeer } from "./usePeer";

const room = ref("");
const text = ref("");
const { state, messages, join, sendChat } = usePeer();

function submit() {
  if (!text.value) return;
  sendChat(text.value);
  text.value = "";
}
</script>

<template>
  <main style="max-width: 520px; margin: 2rem auto; font-family: sans-serif">
    <h1>DropRoom</h1>
    <p>Status: <strong>{{ state }}</strong></p>

    <div>
      <input v-model="room" placeholder="room code" />
      <button @click="join(room)">Join</button>
    </div>

    <ul>
      <li v-for="(m, i) in messages" :key="i">
        <b>{{ m.from }}:</b> {{ m.text }}
      </li>
    </ul>

    <input v-model="text" placeholder="message" @keyup.enter="submit" />
    <button @click="submit">Send</button>
  </main>
</template>