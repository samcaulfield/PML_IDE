# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class SpecifyFileName(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_specify_file_name(self):
        driver = self.driver
       	f = open('property')
        project_name = f.read()
        f.close()
        driver.get(self.base_url + "/" + project_name + "/")
        print "\nNow testing for Specifying the File name when saving to Disk"
        driver.find_element_by_css_selector("div.ace_content").click()
        driver.find_element_by_class_name("ace_text-input").send_keys("process w{}")
        driver.find_element_by_link_text("File").click()
        driver.find_element_by_link_text("Save to disk").click()
        driver.find_element_by_id("fileSaveToDiskNameInput").clear()
        driver.find_element_by_id("fileSaveToDiskNameInput").send_keys("myPml.pml")
	print ("Entered the file name as 'myPml.pml'")
        driver.find_element_by_css_selector("#fileSaveToDiskForm > button.btn.btn-default").click()
        #driver.find_element_by_link_text("downloading...").click()
    
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
