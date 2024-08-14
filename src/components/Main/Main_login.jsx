import { Button, PasswordInput, Text, TextInput } from '@mantine/core';
import React, { useState } from 'react';

function Main_login({ setPhoneNumber, setPassword, setStatus, fetchLogIn }) {

    return (
        <div className='Module-inner'>
            <Text style={{ textAlign: 'center' }} id='title'>Login</Text>
            <TextInput label="Phone Number" withAsterisk placeholder="998 99 999 99 99" id='InputNumber' onChange={(e) => setPhoneNumber(e.currentTarget.value)} autoComplete="off" />
            <PasswordInput label="Password" withAsterisk placeholder="Password" onChange={(e) => setPassword(e.currentTarget.value)} autoComplete="off" type="password" />
            <div className='Module-inner-btn'>
                <Button type='submit' id='SubmitIn' onClick={fetchLogIn}>Sign in</Button>
                <button style={{ color: 'black', border: 'none', background: 'none' }} onClick={() => setStatus(false)}>Create account</button>
            </div>
        </div>
    );
}

export default Main_login;
