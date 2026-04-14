import {defineStore} from "pinia";
import {ref} from "vue";

export const useThemeStore = defineStore('theme', () => {
    const isDarkMode = ref(false)

    const toggleDarkMode = () => {
        isDarkMode.value = document.documentElement.classList.toggle('p-dark')
    }

    return {
        isDarkMode,
        toggleDarkMode
    }
})