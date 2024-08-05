import { Button, Group, Radio, Text, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import React from 'react'

function Main_registration({ setFirstName, setLastName, setPass_word, setPhone_number, setDate, setGender, icon, fetchRegistration }) {
    return (
        <div className='Module-inner-regist'>
            <Text style={{ textAlign: 'center' }} id='title'>Registration</Text>
            <TextInput label="First Name" placeholder="First Name..." withAsterisk onChange={(e) => setFirstName(e.currentTarget.value)} />
            <TextInput label="Last Name" placeholder="Last Name..." withAsterisk onChange={(e) => setLastName(e.currentTarget.value)} />
            <TextInput label="Password" placeholder="Password" withAsterisk onChange={(e) => setPass_word(e.currentTarget.value)} />
            <TextInput label="Phone Number" placeholder="998 99 999 99 99" withAsterisk onChange={(e) => setPhone_number(e.currentTarget.value)} />
            <DatePickerInput label="Pick date" placeholder="Pick date" withAsterisk icon={icon} onChange={(date) => setDate(date)} />
            <Radio.Group label="Gender" withAsterisk id='Gender' onChange={(e) => setGender(e)}>
                <Group mt="xs">
                    <Radio value="Male" label="Male" />
                    <Radio value="Female" label="Female" />
                </Group>
            </Radio.Group>
            <Button type='submit' id='SubmitIn' onClick={fetchRegistration}>Sign up</Button>
        </div>
    )
}

export default Main_registration
