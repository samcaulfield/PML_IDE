# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class SignInTest(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_sign_in(self):
        driver = self.driver
        driver.get(self.base_url + "/seleniumTest/")
        driver.find_element_by_id("signInInfo").click()
        driver.find_element_by_id("signInLink").click()
        driver.find_element_by_link_text("Don't have an account?").click()
        driver.find_element_by_id("registerInputEmail").clear()
        driver.find_element_by_id("registerInputEmail").send_keys("foo83@bar.com")
        driver.find_element_by_id("registerInputPassword").clear()
        driver.find_element_by_id("registerInputPassword").send_keys("123456")
        driver.find_element_by_id("registerSubmitButton").click()
        # Warning: verifyTextNotPresent may require manual changes
        try: self.assertNotRegexpMatches(driver.find_element_by_css_selector("BODY").text, r"^[\s\S]*Account \(Not signed in\) [\s\S]*$")
        except AssertionError as e: self.verificationErrors.append(str(e))
    
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
