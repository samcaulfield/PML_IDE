# -*- coding: utf-8 -*-
from selenium import webdriver
import sqlite3
from random import randint
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

email = ""

def rand():
    return "foo" + str(randint(1000000, 999999999)) + "@bar.com"
	

class RegisterSignInSignOut(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
	
	global email 
	email = rand()
    

    def test_register_sign_in_sign_out(self):
        driver = self.driver
        f = open('property')
	project_name = f.read()
	f.close()
	driver.get(self.base_url + "/" + project_name + "/")
	print "\nNow testing for registration with new email, signing out & signing back with that email "
        driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
	driver.implicitly_wait(3)
        driver.find_element_by_link_text("Don't have an account?").click()
        driver.find_element_by_id("registerInputEmail").clear()
        driver.find_element_by_id("registerInputEmail").send_keys(email)
        driver.find_element_by_id("registerInputPassword").clear()
        driver.find_element_by_id("registerInputPassword").send_keys("123456")
	driver.implicitly_wait(2)
        driver.find_element_by_id("registerSubmitButton").click()
	driver.execute_script("signOut();")
	#driver.implicitly_wait(6)
	
	element = WebDriverWait(driver, 10).until(
		EC.element_to_be_clickable((By.ID, 'signInInfo')))
        driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
        driver.find_element_by_id("signInInputEmail").clear()
        driver.find_element_by_id("signInInputEmail").send_keys(email)
        driver.find_element_by_id("signInInputPassword").clear()
        driver.find_element_by_id("signInInputPassword").send_keys("123456")
        driver.find_element_by_xpath("//button[@type='submit']").click()

    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
	#conn = sqlite3.connect("/home/gulnur/Desktop/pml-studio/user.db")
	#cursor = conn.execute("select email from user")
	#for i in cursor:
	#	print i
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
