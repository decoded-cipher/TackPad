const passwordRef = ref<HTMLDialogElement>(null!)
export function usePasswordModal(){    
const showPasswordDialog = () => {
  passwordRef.value?.showModal()

  return new Promise((resolve) => {
    const onClose = () => {
        passwordRef.value.removeEventListener('close', onClose)
        resolve(null)
    }
    passwordRef.value.addEventListener('close', onClose)
  })
}

const closePasswordDialog = () => {
  passwordRef.value?.close()
}

return {showPasswordDialog, closePasswordDialog, passwordRef}
}