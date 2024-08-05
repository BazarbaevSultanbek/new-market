import { Button, Text, TextInput } from '@mantine/core'
import React from 'react'

function Main_validation({ setCode, fetchValidation, resend_status, countdown, handleResendCode }) {
    return (
        <div className='Module-validation'>
            <Text style={{ textAlign: 'center' }} id='title'>Validation</Text>
            <TextInput placeholder="Verification code" id='codeInput' onChange={(e) => setCode(e.currentTarget.value)} />
            <div className='Module-validation-btn'>
                < Button type='submit' id="CodeSubmit" onClick={fetchValidation}>Submit</Button>
                {
                    !resend_status ? <Button fullWidth mt="xl" variant="outline" color="rgba(33, 107, 255, 1)" id='resend' disabled>{`Resend code after 00:${countdown}`}</Button>
                        : <Button fullWidth mt="xl" variant="outline" id='resend' color="rgba(33, 107, 255, 1)" onClick={handleResendCode}>Resend code</Button>}
            </div>
        </div>
    )
}

export default Main_validation
