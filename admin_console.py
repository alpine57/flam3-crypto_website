#!/usr/bin/python3
"""This is a console that the administrator will be using to check on the site"""

import cmd
import getpass

class HBNBCommand(cmd.Cmd):
    prompt = '(FLAM3 CRYPTO) '
    password = '11212168'  # Set your desired password here

    def __init__(self):
        super().__init__()
        self.authenticate()

    def authenticate(self):
        """Prompt the user for a password and authenticate."""
        attempts = 3
        while attempts > 0:
            pwd = getpass.getpass('Enter password: ')
            if pwd == self.password:
                print('Access granted')
                return
            else:
                attempts -= 1
                print(f'Incorrect password. {attempts} attempt(s) remaining.')
        print('Access denied')
        exit(1)

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

