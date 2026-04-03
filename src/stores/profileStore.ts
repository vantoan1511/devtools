import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface Profile {
  id: string;
  name: string;
  spec: string;
}

const STORAGE_KEY = 'devtool_openapi_profiles'
const ACTIVE_ID_KEY = 'devtool_active_profile_id'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const activeProfileId = ref<string | null>(null)

  // Load from localStorage
  const savedProfiles = localStorage.getItem(STORAGE_KEY)
  if (savedProfiles) {
    try {
      profiles.value = JSON.parse(savedProfiles)
    } catch (e) {
      console.error('Failed to parse profiles from localStorage', e)
    }
  }

  const savedActiveId = localStorage.getItem(ACTIVE_ID_KEY)
  if (savedActiveId) {
    activeProfileId.value = savedActiveId
  }

  // Persist to localStorage
  watch(profiles, (newProfiles) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles))
  }, { deep: true })

  watch(activeProfileId, (newId) => {
    if (newId) {
      localStorage.setItem(ACTIVE_ID_KEY, newId)
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY)
    }
  })

  function addProfile(spec: string, name?: string) {
    if (profiles.value.length >= 5) {
      throw new Error('Maximum of 5 profiles reached.')
    }

    const id = crypto.randomUUID()
    const profileName = name || `Profile ${profiles.value.length + 1}`
    
    profiles.value.push({
      id,
      name: profileName,
      spec
    })
    
    return id
  }

  function updateProfileSpec(id: string, spec: string) {
    const profile = profiles.value.find(p => p.id === id)
    if (profile) {
      profile.spec = spec
    }
  }

  function removeProfile(id: string) {
    const index = profiles.value.findIndex(p => p.id === id)
    if (index !== -1) {
      profiles.value.splice(index, 1)
      if (activeProfileId.value === id) {
        activeProfileId.value = null
      }
    }
  }

  function renameProfile(id: string, newName: string) {
    const profile = profiles.value.find(p => p.id === id)
    if (profile) {
      profile.name = newName
    }
  }

  return {
    profiles,
    activeProfileId,
    addProfile,
    updateProfileSpec,
    removeProfile,
    renameProfile
  }
})
