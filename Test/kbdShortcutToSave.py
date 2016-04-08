# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class Kbrd(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_kbrd(self):
        driver = self.driver
	f = open('property')
	project_name = f.read()
	f.close()
	driver.get(self.base_url + "/" + project_name + "/")
        driver.find_element_by_css_selector("div.ace_content").click()
	driver.find_element_by_class_name("ace_text-input").send_keys("process w {}")
        driver.find_element_by_link_text("Edit").click()
        driver.find_element_by_link_text("Preferences").click()
        Select(driver.find_element_by_id("setKeyboardHandler")).select_by_visible_text("emacs")
        driver.find_element_by_xpath("//div[10]").click()
	driver.find_element_by_class_name("ace_text-input").send_keys(Keys.CONTROL,"x","s")
	time.sleep(1)
	driver.find_element_by_css_selector("#fileSaveToDiskModal > div.modal-dialog > div.modal-content > div.modal-header > button.close").click()
	time.sleep(3)
	driver.find_element_by_link_text("Edit").click()
        driver.find_element_by_link_text("Preferences").click()
        Select(driver.find_element_by_id("setKeyboardHandler")).select_by_visible_text("vim")
        driver.find_element_by_xpath("//div[10]").click()
	driver.find_element_by_class_name("ace_text-input").send_keys(":","w", Keys.ENTER)
	time.sleep(1)	

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
