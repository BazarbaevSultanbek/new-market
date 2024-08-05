import { Button, Text, TextInput } from '@mantine/core'
import React from 'react'

function Main_login({ setPhoneNumber, setPassword, setStatus, fetchLogIn }) {
    return (
        <div className='Module-inner'>
            <Text style={{ textAlign: 'center' }} id='title'>Login</Text>
            <TextInput label="Phone Number" withAsterisk placeholder="998 99 999 99 99" id='InputNumber' onChange={(e) => setPhoneNumber(e.currentTarget.value)} />
            <TextInput label="Password" withAsterisk placeholder="Password" id='InputPassword' onChange={(e) => setPassword(e.currentTarget.value)} />
            <div className='Module-inner-btn'>
                < Button type='submit' id='SubmitIn' onClick={fetchLogIn}>Sign in</Button>
                <button style={{ color: 'black', border: 'none', background: 'none' }} onClick={() => setStatus(false)}>Create account</button>
            </div>
        </div>
    )
}

export default Main_login
