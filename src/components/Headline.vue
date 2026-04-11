<template>
    <div class="flex items-center justify-center gap-2 mb-6">
        <h1 class="headline">Devtools for</h1>
        <RotatingText :texts="['Developers', 'Designers', 'EVERYONE!']"
            mainClassName="headline px-2 sm:px-2 md:px-3  text-black overflow-hidden justify-center rounded-lg"
            :staggerFrom="'last'" :initial="{ y: '100%' }" :animate="{ y: 0 }" :exit="{ y: '-120%' }"
            :staggerDuration="0.025" splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            :transition="{ type: 'spring', damping: 30, stiffness: 400 }" :rotationInterval="2000" />
    </div>
</template>

<style scoped>
@reference "@/assets/main.css";

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap");

.headline {
    @apply text-6xl text-primary font-extrabold;
    font-family: "Inter", sans-serif;
}
</style>