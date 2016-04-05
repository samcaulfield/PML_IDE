# -*- coding: utf-8 -*-
from selenium import webdriver
from random import randint
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
        driver.get(self.base_url + "/seleniumTest")
        driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
        driver.find_element_by_link_text("Don't have an account?").click()
        driver.find_element_by_id("registerInputEmail").clear()
        driver.find_element_by_id("registerInputEmail").send_keys(email)
        driver.find_element_by_id("registerInputPassword").clear()
        driver.find_element_by_id("registerInputPassword").send_keys("123456")
        driver.find_element_by_id("registerSubmitButton").click()
        # ERROR: Caught exception [Error: locator strategy either id or name must be specified explicitly.]
	driver.execute_script("signOut();")        
	#driver.find_element_by_id("signInInfo").click()
        #driver.find_element_by_id("signOutLink").click()
        # ERROR: Caught exception [Error: locator strategy either id or name must be specified explicitly.]
        # ERROR: Caught exception [ERROR: Unsupported command [selectWindow | null | ]]
	driver.execute_script("signOut();")
        driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
        driver.find_element_by_id("signInInputEmail").clear()
        driver.find_element_by_id("signInInputEmail").send_keys(email)
        driver.find_element_by_id("signInInputPassword").clear()
        driver.find_element_by_id("signInInputPassword").send_keys("123456")
        driver.find_element_by_xpath("//button[@type='submit']").click()
        # ERROR: Caught exception [Error: locator strategy either id or name must be specified explicitly.]
    
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
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
