#!/usr/bin/python3
"""This is a console that the administrator will be using to check on the site"""

import cmd
import getpass
import requests
import json

class HBNBCommand(cmd.Cmd):
    prompt = '(FLAM3 CRYPTO) '
    token = None
    admin_username = 'admin'
    admin_password = '11212168'  # Set your desired password here
    api_base_url = 'http://127.0.0.1:5000'  # Change to your deployed app's URL

    def do_login(self, arg):
        """Login as admin to obtain JWT token."""
        try:
            response = requests.post(f'{self.api_base_url}/login', json={
                'username': self.admin_username,
                'password': self.admin_password
            })
            if response.status_code == 200:
                self.token = response.json()['token']
                print('Logged in successfully. Token obtained.')
            else:
                print(f'Failed to login. Status code: {response.status_code}')
                print(response.json()['message'])
        except Exception as e:
            print(f'An error occurred: {e}')

    def authenticated_request(self, method, endpoint, data=None):
        """Make authenticated requests to the API."""
        headers = {'Authorization': f'Bearer {self.token}'}
        url = f'{self.api_base_url}{endpoint}'
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        else:
            response = None
        return response

    def do_check_users(self, arg):
        """Check the list of registered users (protected endpoint)."""
        if not self.token:
            print('You need to login first.')
            return
        response = self.authenticated_request('GET', '/users')
        if response.status_code == 200:
            users = response.json()
            for user in users:
                print(f"ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
        else:
            print(f'Failed to fetch users. Status code: {response.status_code}')
            print(response.json()['message'])

    def do_exit(self, arg):
        """Quit command to exit the program."""
        return True

    def do_EOF(self, arg):
        """EOF command to exit the program."""
        print()  # To ensure a newline before exit
        return True

    def emptyline(self):
        """Do nothing on empty input line."""
        pass

    def do_help(self, arg):
        """List available commands with "help" or detailed help with "help cmd"."""
        super().do_help(arg)

if __name__ == '__main__':
    HBNBCommand().cmdloop()

