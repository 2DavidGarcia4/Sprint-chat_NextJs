'use client'

import styles from './customForm.module.scss'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, ChangeEvent } from 'react'
import { BsX } from 'react-icons/bs'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useUserCtx } from '@/context/contexts'
import { customFetch } from '@/utils/functions'

export default function CustomForm({type}: {type: 'login' | 'register'}){
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const router = useRouter()
  const { setUser } = useUserCtx()

  const handlerSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const email = e.currentTarget.email.value
    const password = e.currentTarget.password.value
    
    if(type == 'login'){
      customFetch(`auth/login`, 'POST', {
        email,
        password
      }).then(res=> {

        if(res.status == 401) return setError('Campos inválidos\nEl coreo o la contraseña es invalida.')

        if(res.token){
          localStorage.setItem('secret', res.token)
          customFetch(`users/@me`).then(res=> {
            if(res.id) setUser(res)
          })
          router.push('/')
        }
      })
      .catch(()=> console.error('Error in login'))

    }else{
      const userName = e.currentTarget.userName.value
      const confirmPassword = e.currentTarget.confirmPassword.value

      if(password != confirmPassword) return setError('Las contraseñas son diferentes')

      customFetch(`auth/register`, 'POST', {
        userName,
        email,
        password
      }).then(res=> {
        if(res.status == 400) {
          if(res.message.includes('llave duplicada') && res.message.includes('user_name')) return setError('El nombre de usuario que ingresaste ya ha sido utilizado por otro usuario.\nIngresa otro nombre de usuario')
          if(res.message.includes('llave duplicada') && res.message.includes('email')) return setError('El correo que ingresaste pertenece a otro usuario.\nIngresa otro correo.')
        }

        if(res.token){
          localStorage.setItem('secret', res.token)
          router.push('/')
        }

        if(res.user) setUser(res.user)
      })
      .catch(()=> console.error('Error in register'))
    }
  }

  const togglePassword = () => {
    setShow(s=> !s)
  }

  const closeError = () => {
    setError('')
  }

  const handlerChange = () => {
    if(error) setError('')
  }

  return (
    <form className={styles.form} onSubmit={handlerSubmit} >
      <div className={styles.form_header}>
        <Image className={styles['form_header-image']} src={'/sprint-icon.png'} alt='icon' width={40} height={40} />
        <h2>Sprint chat</h2>
      </div>

      {type == 'register' && (
        <div className={styles['form-element']}>
          <input className={styles['form-input']} onChange={handlerChange} type="text" id='userName' placeholder='&nbsp;' pattern="^[a-zA-Z0-9]+$" minLength={4} required />
          <span className={styles['form-name']}>Nombre de usuario</span>
          <p className={styles['form-element-info']}>Su nombre de usuario debe de ser unico y tener entre <strong>4</strong> y <strong>30</strong> caracteres, y no debe contener espacios, caracteres especiales ni emojis.</p>
        </div>
      )}

      <div className={styles['form-element']}>
        <input className={styles['form-input']} onChange={handlerChange} type="email" id='email' placeholder='&nbsp;' required />
        <span className={styles['form-name']}>Correo</span>
      </div>

      <div className={styles['form-element']}>
        <input className={styles['form-input']} onChange={handlerChange} type={show ? "text" : "password"} id='password' placeholder='&nbsp;' minLength={8} maxLength={20} required />
        <span className={styles['form-name']}>Contraseña</span>
        {show ? <AiOutlineEye className={styles['form-eye']} onClick={togglePassword} /> : <AiOutlineEyeInvisible className={styles['form-eye']} onClick={togglePassword} />}
        {type == 'register' && 
          <p className={styles['form-element-info']}>Su contraseña debe tener entre <strong>8</strong> y <strong>20</strong> caracteres, contener letras y números, y no debe contener espacios, caracteres especiales ni emojis.</p>
        }
      </div>

      {type == 'register' && <div className={styles['form-element']}>
        <input className={styles['form-input']} onChange={handlerChange} type={show ? "text" : "password"} id='confirmPassword' placeholder='&nbsp;' minLength={8} maxLength={20} required />
        <span className={styles['form-name']}>Confirmar contraseña</span>
        {show ? <AiOutlineEye className={styles['form-eye']} onClick={togglePassword} /> : <AiOutlineEyeInvisible className={styles['form-eye']} onClick={togglePassword} />}
      </div>}

      {error && <div className={styles['form_error']}>
        <BsX className={styles['form_error-close']} onChange={handlerChange} onClick={closeError} />
        <p className={styles['form_error-text']}>{error}</p>
      </div>}

      <button className={styles['form-button']}>{type == 'login' ? 'Iniciar sección' : 'Registrarse'}</button>
      
      {
        type == 'login' ?
          <p className={styles['form-text']}>Aun no tienes una cuenta?, <Link className={styles['form-link']} href={'/register'}>registrate</Link></p> :
          <p className={styles['form-text']}>Ya tienes una cuenta?, <Link className={styles['form-link']} href={'/login'}>inicia sesión</Link></p>
      }
    </form>
  )
}