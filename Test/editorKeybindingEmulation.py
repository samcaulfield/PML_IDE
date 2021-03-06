"""This is a test to check if edit--> Preferences works;
   ;inputs a pml code to the editor, goes to edit-->Preferences,
   ;clears the font size, and changes it to 30px, checks if the font size has been changed to 30px
   ;if not, raises an exception
"""

# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class Editpref(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_editpref(self):
        driver = self.driver
        f = open('property')
	project_name = f.read()
	f.close()
	driver.get(self.base_url + "/" + project_name + "/")
	print "\nNow testing for Editor Keybinding emulation"
	driver.find_element_by_css_selector("div.ace_content").click()
	driver.find_element_by_class_name("ace_text-input").send_keys("""
process simple {    
action x{    
requires { foo }    
provides { foo }    
}    
action y{        
requires { foo }    
provides { bar }     
}
}  
""")
        driver.find_element_by_link_text("Edit").click()
        driver.find_element_by_link_text("Preferences").click()
	driver.find_element_by_id("setFontSize").clear()
	driver.find_element_by_id("setFontSize").send_keys("30px")
	driver.find_element_by_id("setDragDelay").clear()
	driver.find_element_by_id("setDragDelay").send_keys("1")
	driver.implicitly_wait(2)
	font = driver.find_element_by_id("textEditor").value_of_css_property("font-size")
	print "Changed font to %s" %font
	if font != "30px":
		raise Exception ("Font size is not set") 
    
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
