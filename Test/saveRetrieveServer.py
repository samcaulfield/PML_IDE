# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re
from random import randint

email = ""

def rand():
    return "foo" + str(randint(1000000, 999999999)) + "@bar.com"

class SaveRetrieveServer(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True

	global email 
	email = rand()
    
    def test_save_retrieve_server(self):
        driver = self.driver
	f = open('property')
        project_name = f.read()
        f.close()
        driver.get(self.base_url + "/" + project_name + "/")
        print "\nNow testing Saving to and Retrieving from the server"
        driver.find_element_by_css_selector("div.ace_content").click()
        driver.find_element_by_class_name("ace_text-input").send_keys("process w{}")
	driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
	time.sleep(1)
        driver.find_element_by_link_text("Don't have an account?").click()
	time.sleep(1)
        driver.find_element_by_id("registerInputEmail").clear()
	time.sleep(1)
        driver.find_element_by_id("registerInputEmail").send_keys(email)
	time.sleep(1)
        driver.find_element_by_id("registerInputPassword").clear()
	time.sleep(1)
        driver.find_element_by_id("registerInputPassword").send_keys("123456")
	time.sleep(1)

        driver.find_element_by_id("registerSubmitButton").click()
	time.sleep(1)
	driver.execute_script("attemptSaveToServer();")
	time.sleep(1)
        driver.find_element_by_id("fileSaveNameInput").clear()
        driver.find_element_by_id("fileSaveNameInput").send_keys("test")
        driver.find_element_by_css_selector("button.btn.btn-default").click()
	driver.execute_script("attemptOpenFromServer();")
        #driver.find_element_by_link_text("File").click()
        #driver.find_element_by_link_text("Open from server").click()
        driver.find_element_by_css_selector("button.btn.btn-default").click()
        #driver.find_element_by_link_text("File").click()

    
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
